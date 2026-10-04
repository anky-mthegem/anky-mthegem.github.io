/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: AMANDEEP SINGH PORTFOLIO CONTACT FORM HANDLER
 * ============================================================================
 * 
 * Account / Setup:
 * 1. Log in to your Gmail account: ankymthegem2@gmail.com
 * 2. Create a new Google Sheet named: "Portfolio Contact Form Submissions"
 *    (or open an existing spreadsheet).
 * 3. In the top menu, go to: Extensions > Apps Script
 * 4. Delete any code in Code.gs, paste this entire script, and click "Save" (Ctrl+S).
 * 5. Click "Deploy" (top right) > "New deployment"
 *    - Click the gear icon (Select type) > Choose "Web app"
 *    - Description: "Portfolio Contact Form API"
 *    - Execute as: "Me (ankymthegem2@gmail.com)"  <-- VERY IMPORTANT
 *    - Who has access: "Anyone"                   <-- VERY IMPORTANT
 * 6. Click "Deploy" > "Authorize access" > select ankymthegem2@gmail.com
 *    - Click "Advanced" > Click "Go to Untitled project (unsafe)"
 *    - Click "Allow"
 * 7. Copy the "Web app URL" (ends in /exec) and update SCRIPT_URL in script.js!
 * ============================================================================
 */

// Configuration Constants
const RECIPIENT_YAHOO_EMAIL = 'anky_mthegem2@yahoo.co.uk';
const GMAIL_SENDER_ACCOUNT  = 'ankymthegem2@gmail.com';
const TIMEZONE              = 'Asia/Kolkata'; // Indian Standard Time (IST)

/**
 * Handle GET requests (Useful for testing the Web App in browser)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Amandeep Singh Portfolio Contact API is live and operational.',
    receiver_yahoo: RECIPIENT_YAHOO_EMAIL,
    sender_gmail: GMAIL_SENDER_ACCOUNT,
    timestamp: Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST submissions from the portfolio contact form
 */
function doPost(e) {
  // Use ScriptLock to prevent concurrent write collisions in Google Sheets
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(10000); // Wait up to 10 seconds

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Server is busy processing another submission. Please try again in a few moments.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. Extract data from either URL-encoded / FormData parameters or JSON payload
    let data = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = {};
      }
    }

    // 2. Anti-Spam Honeypot check (hidden field)
    if (data._honeypot && data._honeypot.trim() !== '') {
      // Silently discard bot submission
      return ContentService.createTextOutput(JSON.stringify({
        result: 'success',
        message: 'Inquiry received.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Extract and sanitize fields
    const name    = (data.name || '').trim();
    const email   = (data.email || '').trim();
    const phone   = (data.phone || '').trim() || 'Not Provided';
    const subject = (data.subject || '').trim() || 'General Portfolio Inquiry';
    const message = (data.message || '').trim();

    // Required field validation
    if (!name || !email || !message) {
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Name, email, and message are required fields.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Log to Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const timestamp = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    // Auto-create header row if sheet is blank
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp (IST)',
        'Full Name',
        'Email Address',
        'Phone Number',
        'Subject',
        'Inquiry Message'
      ]);

      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4f46e5'); // Portfolio Indigo brand color
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);

      // Auto-size columns for clear readability
      sheet.setColumnWidth(1, 170); // Timestamp
      sheet.setColumnWidth(2, 180); // Name
      sheet.setColumnWidth(3, 220); // Email
      sheet.setColumnWidth(4, 150); // Phone
      sheet.setColumnWidth(5, 220); // Subject
      sheet.setColumnWidth(6, 400); // Message
    }

    // Append submission entry row
    sheet.appendRow([timestamp, name, email, phone, subject, message]);

    // 5. Send Email Notification from ankymthegem2@gmail.com to anky_mthegem2@yahoo.co.uk
    const emailSubject = `🔔 New Portfolio Inquiry: ${subject} (from ${name})`;

    // Plain text email fallback
    const plainBody = 
      `You have received a new contact inquiry from your portfolio website.\n\n` +
      `--------------------------------------------------\n` +
      `SENDER DETAILS\n` +
      `--------------------------------------------------\n` +
      `Full Name  : ${name}\n` +
      `Email      : ${email}\n` +
      `Phone      : ${phone}\n` +
      `Subject    : ${subject}\n` +
      `Timestamp  : ${timestamp} IST\n\n` +
      `--------------------------------------------------\n` +
      `MESSAGE CONTENT\n` +
      `--------------------------------------------------\n` +
      `${message}\n\n` +
      `--------------------------------------------------\n` +
      `This email was automatically dispatched by your Google Apps Script webhook.\n` +
      `Sender Gmail Account : ${GMAIL_SENDER_ACCOUNT}\n` +
      `Recipient Yahoo Mail : ${RECIPIENT_YAHOO_EMAIL}\n` +
      `To respond directly to ${name}, click Reply in your email client.`;

    // Professional HTML Email Template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Portfolio Inquiry</title>
      </head>
      <body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;line-height:1.6;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:26px 32px;color:#ffffff;">
            <div style="display:inline-block;padding:4px 10px;background:rgba(255,255,255,0.2);border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
              Portfolio Webhook
            </div>
            <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.4px;">New Contact Inquiry</h1>
            <p style="margin:4px 0 0;font-size:13.5px;color:rgba(255,255,255,0.9);">
              Dispatched from Amandeep Singh Portfolio
            </p>
          </div>

          <!-- Content Body -->
          <div style="padding:28px 32px;">

            <!-- Sender Overview Card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:700;">
                Sender Information
              </h3>
              <table style="width:100%;border-collapse:collapse;font-size:14.5px;">
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;width:120px;">Name:</td>
                  <td style="padding:6px 0;color:#0f172a;font-weight:700;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Email:</td>
                  <td style="padding:6px 0;">
                    <a href="mailto:${escapeHtml(email)}" style="color:#4f46e5;font-weight:600;text-decoration:none;">
                      ${escapeHtml(email)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Phone:</td>
                  <td style="padding:6px 0;color:#0f172a;">${escapeHtml(phone)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Subject:</td>
                  <td style="padding:6px 0;color:#0f172a;font-weight:600;">${escapeHtml(subject)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Timestamp:</td>
                  <td style="padding:6px 0;color:#64748b;font-size:13.5px;">${timestamp} IST</td>
                </tr>
              </table>
            </div>

            <!-- Message Block -->
            <div style="margin-bottom:28px;">
              <h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;font-weight:700;">
                Inquiry Message
              </h3>
              <div style="background:#ffffff;border:1px solid #cbd5e1;border-left:4px solid #4f46e5;padding:18px 20px;border-radius:0 8px 8px 0;font-size:15px;line-height:1.65;color:#1e293b;white-space:pre-wrap;">
                ${escapeHtml(message)}
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align:center;padding:12px 0 6px;">
              <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(subject)}" 
                 style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14.5px;font-weight:700;box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                ✉️ Reply to ${escapeHtml(name)}
              </a>
            </div>

          </div>

          <!-- Footer Metadata -->
          <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.5;">
            Data logged in Google Sheets. Email routed from <strong>${GMAIL_SENDER_ACCOUNT}</strong> to <strong>${RECIPIENT_YAHOO_EMAIL}</strong>.
          </div>

        </div>
      </body>
      </html>
    `;

    // Send the email via Gmail API
    GmailApp.sendEmail(RECIPIENT_YAHOO_EMAIL, emailSubject, plainBody, {
      htmlBody: htmlBody,
      replyTo: email, // Clicking "Reply" in Yahoo Mail will reply to the sender!
      name: `Amandeep Singh Portfolio (${name})`
    });

    // 6. Return Clean Success JSON Response
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'Thank you! Your message has been sent successfully.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doPost: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Server error processing request: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to escape HTML characters in untrusted visitor input
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
