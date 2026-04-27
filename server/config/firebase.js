import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
    try {
        // If GOOGLE_APPLICATION_CREDENTIALS env var is set, it uses that file.
        // On Cloud Run, it uses the default service account automatically.
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error.message);
        // Fallback for local development if credentials are provided in a different way
        // Or if the user wants to use a specific service account JSON string
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized using FIREBASE_SERVICE_ACCOUNT');
        }
    }
}

export const db = admin.firestore();
export default admin;
