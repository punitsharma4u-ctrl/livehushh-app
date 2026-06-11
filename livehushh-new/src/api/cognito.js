import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { COGNITO, TOKEN_KEY } from './config';
import { setToken } from './client';

const pool = new CognitoUserPool({
  UserPoolId: COGNITO.userPoolId,
  ClientId:   COGNITO.clientId,
});

export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });
    const auth = new AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(auth, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        setToken(idToken);
        const payload = result.getIdToken().payload || {};
        resolve({
          token: idToken,
          email: payload.email || email,
          role: payload['custom:role'] || 'customer',
          name: payload.name || '',
          sub: payload.sub,
        });
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error('New password required — please reset via the existing site')),
    });
  });
}

export function signUp(email, password, attrs = {}) {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      ...(attrs.name ? [new CognitoUserAttribute({ Name: 'name',        Value: attrs.name })] : []),
      ...(attrs.role ? [new CognitoUserAttribute({ Name: 'custom:role', Value: attrs.role })] : []),
    ];
    pool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function signOut() {
  const user = pool.getCurrentUser();
  if (user) user.signOut();
  setToken(null);
  try { localStorage.removeItem('lh_role'); } catch {}
}

export function getCurrentSession() {
  return new Promise((resolve) => {
    const user = pool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      const token = session.getIdToken().getJwtToken();
      setToken(token);
      const payload = session.getIdToken().payload || {};
      resolve({
        token,
        email: payload.email,
        role: payload['custom:role'] || 'customer',
        name: payload.name,
        sub: payload.sub,
      });
    });
  });
}
