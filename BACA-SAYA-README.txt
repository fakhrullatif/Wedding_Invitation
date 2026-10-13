WEDDING INVITATION - WHAT IS IN THIS FOLDER
============================================

index.html                 The blank invitation template. Double-click to open it in your browser.
floral.html                Floral theme: the same invitation in dusty rose and sage, with drawn flowers
                           and falling petals. Edited the same way as index.html (weddingConfig).
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

FLORAL TEMPLATE (floral.html)
- Works exactly like index.html: change the weddingConfig values near the top.
- The cover is illustrated (no photo) by default. To use a photo instead, set "coverImage";
  the cover then switches to white text over the photo, with the flowers kept in the corners.
- Colours: change the --petal-*, --sage-* and --gold values at the top of the <style> section,
  or use "theme" in weddingConfig, e.g. "theme": { "--petal": "#c9b6e4" } for lilac flowers.
- Falling petals are switched off automatically for guests whose phone asks for reduced motion.
