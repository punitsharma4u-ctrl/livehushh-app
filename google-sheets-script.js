/**
 * LiveHushh — Google Sheets Logger
 * ─────────────────────────────────
 * SETUP INSTRUCTIONS:
 *
 * 1. Go to sheets.google.com → create a new spreadsheet
 * 2. Rename "Sheet1" tab to "Customers"
 * 3. Add a second tab and name it "Owners"
 * 4. Add these headers in Row 1 of BOTH tabs:
 *    Name | Email | Role | Restaurant | Joined At
 *
 * 5. In the spreadsheet, click Extensions → Apps Script
 * 6. Delete all existing code and paste this entire file
 * 7. Click Save (floppy disk icon)
 * 8. Click Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 9. Click Deploy → copy the Web App URL
 * 10. Paste that URL into auth.html where it says:
 *     const SHEETS_URL = '';
 *     → becomes: const SHEETS_URL = 'https://script.google.com/...';
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                                .getSheetByName(data.tab === 'Owners' ? 'Owners' : 'Customers');

    sheet.appendRow([
      data.name     || '',
      data.email    || '',
      data.role     || '',
      data.restaurant || 'N/A',
      data.joinedAt || new Date().toISOString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually in Apps Script to verify it works
function testLog() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  sheet.appendRow(['Test User', 'test@example.com', 'customer', 'N/A', new Date().toISOString()]);
  Logger.log('Test row added successfully');
}
