// 공통 유틸리티

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return SpreadsheetApp.openById(id);
}

function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

function hashPassword(password) {
  const salt = PropertiesService.getScriptProperties().getProperty('PASSWORD_SALT') || 'woohwa_salt_2026';
  const combined = password + salt;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
  return digest.map(b => (b + 256).toString(16).slice(-2)).join('');
}

function generateId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeStr(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function appendRow(sheet, obj, headers) {
  const row = headers.map(h => obj[h] ?? '');
  sheet.appendRow(row);
}
