const admin = require('firebase-admin');
const serviceAccount = {
  type: process.env.FIREBASE_type,
  project_id: process.env.FIREBASE_project_id,
  private_key_id: process.env.FIREBASE_private_key_id,
  private_key: `-----BEGIN PRIVATE KEY-----\n${process.env.FIREBASE_private_key.split(',').join('\n')}\n-----END PRIVATE KEY-----`,
  client_email: process.env.FIREBASE_client_email,
  client_id: process.env.FIREBASE_client_id,
  auth_uri: process.env.FIREBASE_auth_uri,
  token_uri: process.env.FIREBASE_token_uri,
  auth_provider_x509_cert_url: process.env.FIREBASE_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url
};

const returnObj = {};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  returnObj.db = admin.firestore();
} catch (e) {
  console.log('--- Error firebase', e);
}

module.exports = returnObj;
