/**
 * LiveHushh — AWS Configuration
 *
 * After running `amplify push`, replace these placeholder values with the
 * real ones printed in the terminal (or found in aws-exports.js).
 *
 * NEVER commit real credentials to git — add aws-config.js to .gitignore
 * once you fill in the real values, or use Amplify environment variables.
 */

window.LH_CONFIG = {
  // ─── Cognito ────────────────────────────────────────────────────────────
  cognito: {
    region:       'us-east-1',
    userPoolId:   'us-east-1_ewcJ1VvTa',
    clientId:     '4fr5c7a8m4h2i4c4hldun0pd3g',   // Web client
  },

  // ─── API Gateway (Lambda proxy) ─────────────────────────────────────────
  api: {
    baseUrl: 'https://j76uxpya68.execute-api.us-east-1.amazonaws.com/prod',
  },

  // ─── Google Sheets (optional — for lead capture) ─────────────────────────
  sheetsUrl: '',  // paste your Apps Script Web App URL here if using it
};
