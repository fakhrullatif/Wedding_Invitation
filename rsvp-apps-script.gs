/**
 * Wedding RSVP → Google Sheet
 * ---------------------------------------------------------------------------------
 * Paste this whole file into the Apps Script editor of the Google Sheet that should
 * collect replies (in the Sheet: Extensions → Apps Script), then deploy it as a
 * Web app (Execute as: Me, Who has access: Anyone) and copy the /exec URL into
 * weddingConfig.rsvpEndpoint.
 *
 * Tabs used in the Sheet:
 *   RSVP   – created automatically; one row per invitation code (or per reply if no codes).
 *   Codes  – OPTIONAL. Create it yourself to only accept codes printed on your cards:
 *              Column A: Code   (format the column as Plain text so 0123 keeps its zero)
 *              Column B: MaxGuests  (optional — blank means no limit)
 *              Column C: Household  (optional — e.g. "Keluarga Encik Ali"; shown to the guest)
 *            Row 1 is a header row. If this tab does not exist, any code of the right length
 *            is accepted and every reply is simply added as a new row.
 *
 * After ANY change to this script you must publish a new version:
 *   Deploy → Manage deployments → (pencil) Edit → Version: New version → Deploy.
 * Otherwise the /exec URL keeps running the old code.
 * ---------------------------------------------------------------------------------
 */

const RSVP_SHEET = 'RSVP';
const CODES_SHEET = 'Codes';
const HEADERS = ['Timestamp', 'Code', 'Household', 'Name', 'Phone', 'Attending', 'Guests', 'Language', 'Updates'];

/** Lets you open the /exec URL in a browser to confirm the deployment works. */
function doGet() {
  return json_({ ok: true, status: 'RSVP endpoint is running' });
}

/** Receives { action: "check" | "submit", ... } from the invitation page. */
function doPost(e) {
  const lock = LockService.getScriptLock();   // stops two replies writing the same row at once
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const code = clean_(data.code, 12);
    const codeInfo = lookupCode_(code);         // null = no Codes tab → accept any code

    if (codeInfo && !codeInfo.found) return json_({ ok: false, error: 'invalid_code' });

    if (data.action === 'check') {
      return json_({ ok: true, household: codeInfo ? codeInfo.household : '', maxGuests: codeInfo ? codeInfo.maxGuests : null });
    }

    if (data.action !== 'submit') return json_({ ok: false, error: 'bad_request' });

    const name = clean_(data.name, 80);
    const phone = clean_(data.phone, 20);
    const attending = data.attending === 'yes' ? 'Yes' : 'No';
    const guests = attending === 'Yes' ? Math.max(1, Math.min(parseInt(data.guests, 10) || 1, 50)) : 0;
    if (!name) return json_({ ok: false, error: 'bad_request' });
    if (codeInfo && codeInfo.maxGuests && guests > codeInfo.maxGuests) {
      return json_({ ok: false, error: 'too_many_guests', maxGuests: codeInfo.maxGuests });
    }

    const sheet = rsvpSheet_();
    const row = [new Date(), code, codeInfo ? codeInfo.household : '', name, phone, attending, guests, clean_(data.lang, 5), 0];

    // With a Codes tab, each code has ONE row: a second reply (e.g. a change of plan) updates it.
    // Without a Codes tab, codes are not unique, so every reply is a new row.
    const existing = codeInfo ? findRowByCode_(sheet, code) : 0;
    if (existing) {
      row[8] = (Number(sheet.getRange(existing, 9).getValue()) || 0) + 1;   // count of updates
      sheet.getRange(existing, 1, 1, row.length).setValues([asText_(row)]);
    } else {
      sheet.appendRow(asText_(row));
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------- helpers ------------------------------- */

function rsvpSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(RSVP_SHEET) || ss.insertSheet(RSVP_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function lookupCode_(code) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CODES_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getDisplayValues();
  const hit = rows.find(function (r) { return String(r[0]).trim() === code; });
  if (!hit) return { found: false };
  return { found: true, maxGuests: parseInt(hit[1], 10) || null, household: String(hit[2] || '').trim() };
}

function findRowByCode_(sheet, code) {
  if (!code || sheet.getLastRow() < 2) return 0;
  const codes = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = 0; i < codes.length; i++) if (String(codes[i][0]).trim() === code) return i + 2;
  return 0;
}

/** Trim, shorten, and stop text such as "=IMPORTXML(...)" being treated as a formula. */
function clean_(value, max) {
  let s = String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Codes and phone numbers are written as text so Sheets doesn't drop leading zeros. */
function asText_(row) {
  return row.map(function (v, i) { return (i === 1 || i === 4) && v !== '' ? "'" + String(v).replace(/^'/, '') : v; });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
