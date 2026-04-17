// 인증 서비스

function verifyPassword(password) {
  const sheet = getSheet('Settings');
  const rows = sheetToObjects(sheet);
  const setting = rows.find(r => r.key === 'userPasswordHash');
  if (!setting) return false;

  const inputHash = hashPassword(escapeStr(String(password).toLowerCase().trim()));
  return inputHash === setting.value;
}

function getActiveCoaches() {
  const sheet = getSheet('Coaches');
  const rows = sheetToObjects(sheet);
  return rows
    .filter(r => r.active === true || r.active === 'TRUE')
    .map(r => ({
      id: r.id,
      name: r.name,
      active: true,
    }));
}

function selectCoach(coachId, phoneSuffix) {
  const sheet = getSheet('Coaches');
  const rows = sheetToObjects(sheet);
  const coach = rows.find(r => r.id === coachId && (r.active === true || r.active === 'TRUE'));
  if (!coach) throw new Error('코치를 찾을 수 없습니다.');

  // 동명이인 확인
  const sameNameCoaches = rows.filter(r => r.name === coach.name && (r.active === true || r.active === 'TRUE'));
  if (sameNameCoaches.length > 1) {
    if (!phoneSuffix) {
      return { coach: { id: coach.id, name: coach.name }, requiresPhoneVerification: true };
    }
    const phoneSuffixStr = String(phoneSuffix).trim();
    const phone = String(coach.phone).replace(/[^0-9]/g, '');
    if (!phone.endsWith(phoneSuffixStr)) {
      throw new Error('연락처 뒷자리가 일치하지 않습니다.');
    }
  }

  return {
    coach: { id: coach.id, name: coach.name, lastCarNumber: coach.lastCarNumber || '' },
    requiresPhoneVerification: false,
  };
}

function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const response = UrlFetchApp.fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
    );
    const info = JSON.parse(response.getContentText());
    if (info.error) return null;

    const email = info.email;
    const adminSheet = getSheet('AdminList');
    const admins = sheetToObjects(adminSheet);
    const isAdmin = admins.some(a => a.email === email);
    if (!isAdmin) return null;

    return email;
  } catch (e) {
    return null;
  }
}
