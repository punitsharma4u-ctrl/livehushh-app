// ─── LiveHushh API configuration ─────────────────────────────────────────
// Override at build time with REACT_APP_API_BASE in .env or Amplify env vars.

export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  'https://j76uxpya68.execute-api.us-east-1.amazonaws.com/prod';

export const COGNITO = {
  region:     process.env.REACT_APP_COGNITO_REGION   || 'us-east-1',
  userPoolId: process.env.REACT_APP_COGNITO_POOL_ID  || 'us-east-1_ewcJ1VvTa',
  clientId:   process.env.REACT_APP_COGNITO_CLIENT   || '4fr5c7a8m4h2i4c4hldun0pd3g',
};

export const TOKEN_KEY = 'lh_token';
