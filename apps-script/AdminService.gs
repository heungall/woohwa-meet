// 관리자 서비스

function adminGetReservations(token, from, to) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Reservations');
  const rows = sheetToObjects(sheet);

  return rows.filter(r => {
    if (r.status !== 'active') return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });
}

function adminCancelReservation(token, reservationId) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Reservations');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  const statusCol = headers.indexOf('status');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === reservationId) {
      sheet.getRange(i + 1, statusCol + 1).setValue('cancelled');
      logAccess('ADMIN_CANCEL', email, reservationId);
      return;
    }
  }
  throw new Error('예약을 찾을 수 없습니다.');
}

function adminGetCoaches(token) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Coaches');
  return sheetToObjects(sheet).map(r => ({
    id: r.id, name: r.name, phone: r.phone,
    lastCarNumber: r.lastCarNumber || '',
    active: r.active === true || r.active === 'TRUE',
  }));
}

function adminCreateCoach(token, coach) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Coaches');
  const existing = sheetToObjects(sheet);
  const maxId = existing.reduce((max, r) => {
    const num = parseInt(r.id.replace('C', '')) || 0;
    return Math.max(max, num);
  }, 0);

  const newId = 'C' + String(maxId + 1).padStart(3, '0');
  const row = {
    id: newId,
    name: escapeStr(coach.name),
    phone: escapeStr(coach.phone),
    lastCarNumber: '',
    active: true,
  };
  appendRow(sheet, row, ['id','name','phone','lastCarNumber','active']);
  logAccess('ADMIN_CREATE_COACH', email, newId);
  return row;
}

function adminUpdateCoach(token, coachId, updates) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Coaches');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] !== coachId) continue;
    Object.entries(updates).forEach(([key, val]) => {
      const col = headers.indexOf(key);
      if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(val);
    });
    logAccess('ADMIN_UPDATE_COACH', email, coachId);
    return;
  }
  throw new Error('코치를 찾을 수 없습니다.');
}

function adminGetBlockedSlots(token) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');
  return sheetToObjects(getSheet('BlockedSlots'));
}

function adminCreateBlockedSlot(token, slot) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('BlockedSlots');
  const id = generateId('BLK');
  const row = {
    id,
    type: slot.type,
    weekStartDate: slot.weekStartDate || '',
    dayOfWeek: slot.dayOfWeek,
    time: slot.time,
    room: slot.room,
    reason: escapeStr(slot.reason || ''),
  };
  appendRow(sheet, row, ['id','type','weekStartDate','dayOfWeek','time','room','reason']);
  return row;
}

function adminDeleteBlockedSlot(token, slotId) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('BlockedSlots');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === slotId) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function adminGetSettings(token) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const rows = sheetToObjects(getSheet('Settings'));
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  // 비밀번호 해시는 반환하지 않음
  delete settings['userPasswordHash'];
  return settings;
}

function adminUpdatePassword(token, newPassword) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');
  if (!newPassword || newPassword.length < 4) throw new Error('비밀번호는 4자 이상이어야 합니다.');

  const sheet = getSheet('Settings');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyCol = headers.indexOf('key');
  const valCol = headers.indexOf('value');

  const newHash = hashPassword(String(newPassword).toLowerCase().trim());
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyCol] === 'userPasswordHash') {
      sheet.getRange(i + 1, valCol + 1).setValue(newHash);
      logAccess('ADMIN_CHANGE_PASSWORD', email, '');
      return;
    }
  }
  // 없으면 추가
  sheet.appendRow(['userPasswordHash', newHash]);
}

function adminUpdateGuideContent(token, content) {
  const email = verifyAdminToken(token);
  if (!email) throw new Error('관리자 인증이 필요합니다.');

  const sheet = getSheet('Settings');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyCol = headers.indexOf('key');
  const valCol = headers.indexOf('value');

  for (let i = 1; i < data.length; i++) {
    if (data[i][keyCol] === 'guideContent') {
      sheet.getRange(i + 1, valCol + 1).setValue(content);
      return;
    }
  }
  sheet.appendRow(['guideContent', content]);
}

function getGuideContent() {
  const rows = sheetToObjects(getSheet('Settings'));
  const setting = rows.find(r => r.key === 'guideContent');
  return { content: setting ? setting.value : '' };
}
