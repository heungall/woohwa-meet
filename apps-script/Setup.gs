// 최초 1회 실행: 스프레드시트 초기 세팅
// Apps Script 에디터에서 직접 실행하세요.

function initialSetup() {
  const ss = getSpreadsheet();

  // Settings 시트 초기값
  const settingsSheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  if (settingsSheet.getLastRow() < 1) {
    settingsSheet.appendRow(['key', 'value']);
  }
  // 초기 비밀번호 'woohwa' 해시화하여 저장
  const existingRows = settingsSheet.getDataRange().getValues();
  const hasPassword = existingRows.some(r => r[0] === 'userPasswordHash');
  if (!hasPassword) {
    const initialHash = hashPassword('woohwa');
    settingsSheet.appendRow(['userPasswordHash', initialHash]);
    settingsSheet.appendRow(['guideContent', '']);
    Logger.log('초기 비밀번호 설정 완료: woohwa → ' + initialHash);
  }

  // 각 시트 헤더 초기화
  const sheets = {
    Reservations: ['id','date','time','room','coachId','name','phone','carNumber','createdAt','status'],
    BlockedSlots: ['id','type','weekStartDate','dayOfWeek','time','room','reason'],
    Coaches: ['id','name','phone','lastCarNumber','active'],
    AdminList: ['email','role'],
    AccessLog: ['timestamp','action','coachId','detail'],
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      Logger.log(`${name} 시트 생성 완료`);
    }
  });

  Logger.log('초기 설정 완료! 관리자 이메일을 AdminList 시트에 추가해주세요.');
}
