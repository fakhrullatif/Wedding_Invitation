# RSVP to Google Sheet — setup guide

The invitation's RSVP form can send each reply straight into a Google Sheet the couple owns.
It uses a small Google Apps Script "web app" (`assets/rsvp-apps-script.gs`) as the receiver.
Free, no server, about 15 minutes. Works whether the page is hosted or opened as a local file.

## Contents
1. One-time setup
2. Optional: only accept printed codes (Codes tab)
3. Connect the invitation
4. Test it
5. Reading the replies
6. Security and privacy notes
7. Troubleshooting

---

## 1. One-time setup

1. Create a new Google Sheet (e.g. "RSVP Aisyah & Hafiz") with the Google account that should own the replies.
2. In the Sheet: **Extensions → Apps Script**. Delete the sample code and paste the whole of
   `rsvp-apps-script.gs`. Save.
3. **Deploy → New deployment**. Click the gear next to "Select type" → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Then **Deploy**.
4. Google asks for permission to edit your spreadsheets. Because this is your own unverified
   script, it shows an "app isn't verified" warning: choose **Advanced → Go to (project name)**
   and **Allow**. The script only touches the Sheet it is attached to.
5. Copy the **Web app URL** — it ends in `/exec`.

Google's menus change from time to time; if a label differs slightly, the steps are the same.

## 2. Optional: only accept printed codes

Only do this if each household gets its own code on a printed or individual card.

1. Add a tab named exactly **Codes**.
2. Format column A as **Plain text** (Format → Number → Plain text) so codes like `0123` keep their zero.
3. Row 1 headers, then one row per invitation:

| Code | MaxGuests | Household |
|---|---|---|
| 0123 | 2 | Keluarga Encik Ali |
| 4567 | 4 | Keluarga Puan Siti |
| 8910 |  | Rakan sekerja |

- **MaxGuests** blank = no limit for that code.
- **Household** is shown to the guest after they enter the code ("Jemputan untuk: Keluarga Encik Ali").
- Code length must match `rsvpCodeLength` in the config.

With a Codes tab: unknown codes are rejected, head-count limits are enforced, and a second reply
from the same code **updates** that household's row (the `Updates` column counts changes).
Without a Codes tab: any code of the right length is accepted and every reply is a new row.

**No codes at all?** Set `"rsvpCodeLength": 0` — the code step disappears and guests go straight to the form.
This is the better choice when the same link is sent to everyone on WhatsApp, because a code
everybody shares checks nothing.

## 3. Connect the invitation

In the config:

```json
"rsvpEndpoint": "https://script.google.com/macros/s/AKfy.../exec",
"rsvpCodeLength": 0,
"rsvpAskPhone": true
```

Rebuild with `build_invite.py` (or edit the value in the built page's `weddingConfig`).

## 4. Test it

1. Open the `/exec` URL in a browser: it should show `{"ok":true,"status":"RSVP endpoint is running"}`.
2. Open the invitation, send a test reply, and check a row appears in the **RSVP** tab.
3. Delete the test row before sending the invitation out.

## 5. Reading the replies

The RSVP tab has: Timestamp, Code, Household, Name, Phone, Attending, Guests, Language, Updates.
Useful formulas in another tab:

- Total attending guests: `=SUMIF(RSVP!F:F,"Yes",RSVP!G:G)`
- Households replied: `=COUNTA(RSVP!A2:A)`
- Without a Codes tab, people may reply twice — sort by Name/Phone and keep the latest Timestamp.

Download as `.xlsx` or `.csv` (File → Download) for pandas or SAS if needed.

## 6. Security and privacy notes

- The `/exec` URL is visible in the page source. Anyone who finds it could send fake replies.
  A Codes tab blocks unknown codes; without one, check for odd rows before final numbers.
- Text that looks like a spreadsheet formula (`=...`) is stored as plain text, so a reply cannot
  run formulas in the Sheet.
- The Sheet holds guests' names and phone numbers. Keep it private (do not "share with anyone
  with the link"), and delete it or the replies once the wedding is over.
- To switch the RSVP off after the event: Deploy → Manage deployments → **Archive** the deployment.
  The form will then show the "could not be sent" message.

## 7. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Guest sees "could not be sent" | `/exec` URL wrong, or deployment access is not "Anyone". Re-check step 3. |
| Changes to the script have no effect | You must publish a new version: Deploy → Manage deployments → Edit → Version: New version. |
| Codes like 0123 are "not found" | Codes column not Plain text, so Sheets stored 123. Re-type them after formatting. |
| Rows appear but no Household | Codes tab name must be exactly `Codes`, codes in column A from row 2. |
| URL ends in `/dev` | That is the test URL and only works for you. Use the `/exec` URL. |
