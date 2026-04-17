// 예약 서비스

function getWeeklyReservations(weekStart, coachId) {
  const sheet = getSheet('Reservations');
  const rows = sheetToObjects(sheet);

  // weekStart 기준 5일 (월~금)
  const dates = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd'));
  }

  return rows
    .filter(r => dates.includes(r.date) && r.status === 'active')
    .map(r => ({
      id: r.id,
      date: r.date,
      time: r.time,
      room: Number(r.room),
      coachId: r.coachId,
      name: r.name,
      carNumber: r.coachId === coachId ? r.carNumber : undefined,
      createdAt: r.createdAt,
      status: r.status,
    }));
}

function createReservation(coachId, slots, carNumber) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    const sheet = getSheet('Reservations');
    const coachSheet = getSheet('Coaches');
    const coachRows = sheetToObjects(coachSheet);
    const coach = coachRows.find(r => String(r.id) === String(coachId));
    if (!coach) throw new Error('코치를 찾을 수 없습니다.');

    const existing = sheetToObjects(sheet);
    const created = [];

    for (const slot of slots) {
      const dateStr = escapeStr(slot.date);
      const timeStr = escapeStr(slot.time);
      const room = Number(slot.room);

      // 중복 확인
      const conflict = existing.find(
        r => r.date === dateStr && r.time === timeStr && Number(r.room) === room && r.status === 'active'
      );
      if (conflict) throw new Error(`${dateStr} ${timeStr} 상담실 ${room}은 이미 예약되었습니다.`);

      // 과거 시간 확인
      const slotDate = new Date(`${dateStr}T${timeStr}:00+09:00`);
      if (slotDate <= new Date()) throw new Error('지난 시간은 예약할 수 없습니다.');

      const id = `R${dateStr.replace(/-/g,'')}${timeStr.replace(':','')}${room}`;
      const now = Utilities.formatDate(new Date(), 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss");

      const row = {
        id, date: dateStr, time: timeStr, room,
        coachId, name: coach.name, phone: coach.phone,
        carNumber: carNumber ? escapeStr(carNumber) : '',
        createdAt: now, status: 'active',
      };

      const headers = ['id','date','time','room','coachId','name','phone','carNumber','createdAt','status'];
      appendRow(sheet, row, headers);
      existing.push(row);
      created.push(row);

      logAccess('CREATE_RESERVATION', coachId, `${dateStr} ${timeStr} 상담실${room}`);
    }

    // 차량번호 업데이트
    if (carNumber) {
      const coachData = coachSheet.getDataRange().getValues();
      const headers = coachData[0];
      const coachIdCol = headers.indexOf('id');
      const carCol = headers.indexOf('lastCarNumber');
      for (let i = 1; i < coachData.length; i++) {
        if (coachData[i][coachIdCol] === coachId) {
          coachSheet.getRange(i + 1, carCol + 1).setValue(escapeStr(carNumber));
          break;
        }
      }
    }

    return created;
  } finally {
    lock.releaseLock();
  }
}

function cancelReservation(reservationId, coachId) {
  const sheet = getSheet('Reservations');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  const coachIdCol = headers.indexOf('coachId');
  const statusCol = headers.indexOf('status');
  const dateCol = headers.indexOf('date');
  const timeCol = headers.indexOf('time');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] !== reservationId) continue;
    if (data[i][coachIdCol] !== coachId) throw new Error('본인 예약만 취소할 수 있습니다.');
    if (data[i][statusCol] !== 'active') throw new Error('이미 취소된 예약입니다.');

    // 1시간 전 확인
    const slotDate = new Date(`${data[i][dateCol]}T${data[i][timeCol]}:00+09:00`);
    const deadline = new Date(slotDate.getTime() - 60 * 60 * 1000);
    if (new Date() >= deadline) throw new Error('취소 시한이 지났습니다. 시작 1시간 전까지만 취소할 수 있습니다.');

    sheet.getRange(i + 1, statusCol + 1).setValue('cancelled');
    logAccess('CANCEL_RESERVATION', coachId, reservationId);
    return;
  }
  throw new Error('예약을 찾을 수 없습니다.');
}

function getBlockedSlots(weekStart) {
  const sheet = getSheet('BlockedSlots');
  const rows = sheetToObjects(sheet);
  return rows.filter(r =>
    r.type === 'common' ||
    (r.type === 'weekly' && r.weekStartDate === weekStart)
  );
}

function logAccess(action, coachId, detail) {
  try {
    const sheet = getSheet('AccessLog');
    const now = Utilities.formatDate(new Date(), 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss");
    sheet.appendRow([now, action, coachId, detail]);
  } catch (e) {
    // 로그 실패는 무시
  }
}
