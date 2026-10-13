WEDDING INVITATION - WHAT IS IN THIS FOLDER
============================================

index.html                 The blank invitation template. Double-click to open it in your browser.
contoh-aisyah-hafiz.html   An example filled in with sample names, so you can see a finished card.
rsvp-apps-script.gs        Code to paste into your Google Sheet so RSVP replies are saved there.
rsvp-google-sheet.md       Step-by-step guide for setting up that Google Sheet (open with Notepad).
wedding-invitation.skill   The skill file (already saved in Claude; keep this as a backup).
skill\wedding-invitation\  The same skill, unzipped. Only needed if you use Claude Code later.

TO EDIT YOUR INVITATION
1. Right-click index.html > Open with > Notepad (or VS Code).
2. Near the top, find:  const weddingConfig = {
3. Change the text inside the "quotes" (names, date, venue...). Keep the quotes and commas.
4. Save, then double-click index.html to see the result.
Or simply ask Claude: "update my invitation in the Wedding_Invitation folder" and give the details.

PHOTOS AND MUSIC
Put cover.jpg / lagu.mp3 in THIS folder, then in weddingConfig set:
  "coverImage": "cover.jpg",
  "backgroundMusic": "lagu.mp3",
