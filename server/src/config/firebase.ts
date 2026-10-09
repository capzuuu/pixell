import fs from 'fs';
import path from 'path';
import { initializeApp, cert, applicationDefault, getApps, App, AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';
import { getAuth, Auth } from 'firebase-admin/auth';
import { ENV } from './env';

let firebaseApp: App | null = null;
let firestoreInstance: Firestore | null = null;
let rtdbInstance: Database | null = null;
let authInstance: Auth | null = null;
let isConfigured = false;

export function initFirebaseAdmin(): App | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // 1. Check for explicit JSON service account key file
    const potentialPaths = [
      ENV.FIREBASE_SERVICE_ACCOUNT_PATH ? path.resolve(ENV.FIREBASE_SERVICE_ACCOUNT_PATH) : '',
      '/etc/secrets/serviceAccountKey.json',
      '/etc/secrets/service_account.json',
      path.resolve(__dirname, '../../serviceAccountKey.json'),
      path.resolve(__dirname, '../../../serviceAccountKey.json'),
      path.resolve(process.cwd(), 'serviceAccountKey.json')
    ].filter(Boolean);

    let credential = null;

    // Check for inline JSON environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = cert(serviceAccount);
        console.log('🔥 [Firebase Admin] Loaded service account credentials from FIREBASE_SERVICE_ACCOUNT_JSON env variable.');
      } catch (e) {
        console.warn('⚠️ [Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      }
    }

    if (!credential) {
      for (const p of potentialPaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, 'utf-8');
            const serviceAccount = JSON.parse(raw);
            credential = cert(serviceAccount);
            console.log(`🔥 [Firebase Admin] Loaded service account credentials from: ${p}`);
            break;
          } catch (e) {
            console.warn(`⚠️ [Firebase Admin] Found key at ${p} but failed to parse:`, e);
          }
        }
      }
    }

    // 2. Check for individual environment variables
    if (!credential && ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
      const privateKey = ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      credential = cert({
        projectId: ENV.FIREBASE_PROJECT_ID,
        clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
        privateKey
      });
      console.log(`🔥 [Firebase Admin] Authenticated with ENV credentials for project: ${ENV.FIREBASE_PROJECT_ID}`);
    }

    // 3. Check for Application Default Credentials or Emulator
    if (!credential && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIRESTORE_EMULATOR_HOST || ENV.FIREBASE_PROJECT_ID)) {
      try {
        credential = applicationDefault();
        console.log('🔥 [Firebase Admin] Using Application Default Credentials');
      } catch {
        if (!process.env.FIRESTORE_EMULATOR_HOST) {
          // No emulator host
        }
      }
    }

    if (!credential && !process.env.FIRESTORE_EMULATOR_HOST) {
      console.log('ℹ️ [Firebase Admin] No Firebase credentials provided in .env or serviceAccountKey.json.');
      console.log('ℹ️ [Firebase Admin] Set USE_FIREBASE=true and provide credentials to connect to live Firestore.');
      return null;
    }

    const appConfig: AppOptions = {};
    if (credential) {
      appConfig.credential = credential;
    }
    if (ENV.FIREBASE_PROJECT_ID) {
      appConfig.projectId = ENV.FIREBASE_PROJECT_ID;
    }
    if (ENV.FIREBASE_DATABASE_URL) {
      appConfig.databaseURL = ENV.FIREBASE_DATABASE_URL;
    }

    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0]!;
    } else {
      firebaseApp = initializeApp(appConfig);
    }

    firestoreInstance = getFirestore(firebaseApp);
    // Ignore undefined properties to avoid Firestore write errors on partial fields
    firestoreInstance.settings({ ignoreUndefinedProperties: true });

    if (ENV.FIREBASE_DATABASE_URL) {
      rtdbInstance = getDatabase(firebaseApp);
    }

    try {
      authInstance = getAuth(firebaseApp);
    } catch (authErr) {
      console.warn('⚠️ [Firebase Admin] Auth module init warning:', authErr);
    }

    isConfigured = true;
    console.log('✅ [Firebase Admin] Initialized successfully. Firestore, RTDB & Auth are ready.');
    return firebaseApp;
  } catch (error) {
    console.error('❌ [Firebase Admin] Failed to initialize Firebase Admin SDK:', error);
    isConfigured = false;
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (!firestoreInstance) {
    initFirebaseAdmin();
  }
  return firestoreInstance;
}

export function getFirebaseRtdb(): Database | null {
  if (!rtdbInstance) {
    initFirebaseAdmin();
  }
  return rtdbInstance;
}

export function getFirebaseAuth(): Auth | null {
  if (!authInstance) {
    initFirebaseAdmin();
  }
  return authInstance;
}

export function isFirebaseConfigured(): boolean {
  if (!isConfigured) {
    initFirebaseAdmin();
  }
  return isConfigured;
}

export type { Firestore, Database, App, Auth };
