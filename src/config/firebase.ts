// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import axios from "axios";

// Helper function to send welcome email
const sendWelcomeEmail = async (userName: string | null, email: string) => {
  try {
    // Validate inputs
    if (!email) {
      throw new Error("Email is required");
    }

    // Validate environment variables
    if (!import.meta.env.VITE_EMAIL_API_URL || !import.meta.env.VITE_EMAIL_API_KEY) {
      throw new Error(
        "Missing VITE_EMAIL_API_URL or VITE_EMAIL_API_KEY in environment variables"
      );
    }

    // Send email via API
    const response = await axios.post(
      import.meta.env.VITE_EMAIL_API_URL,
      {
        to: email,
        userName: userName || "TrailerBaser",
        from: "welcome@api.trailerbase.tech",
      },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_EMAIL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Email sent to ${email}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Helper to get user's name
const getUserName = (user: User): string => {
  if (user.displayName && user.displayName.trim() !== "") {
    return user.displayName;
  }
  // Fallback to email prefix
  return user.email?.split('@')[0] || "User";
};

// Helper: only include defined/non-empty values to avoid overwriting existing fields with null/undefined
const compact = (obj: Record<string, any> | null | undefined) => {
  if (!obj) return {};
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")) {
      out[k] = v;
    }
  }
  return out;
};

// Build a minimal profile update object from Firebase Auth user
const buildProfileFromAuthUser = (user: User) => {
  return compact({
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
    photoURL: user.photoURL ?? undefined,
    providerId: user.providerData?.[0]?.providerId ?? undefined,
    lastSignIn: user.metadata?.lastSignInTime ?? undefined,
    updatedAt: serverTimestamp(),
  });
};

// Merge incoming auth profile into Firestore user doc WITHOUT overwriting existing non-empty values.
// Only writes fields that are missing/empty on the existing doc.
export const upsertUserProfile = async (user: User) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const authProfile = buildProfileFromAuthUser(user);
    if (Object.keys(authProfile).length === 0) return;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(userDocRef);
      const existing = snap.exists() ? snap.data() : {};

      // prepare update: only set fields that do not exist on the document
      const update: Record<string, any> = {};
      for (const key of Object.keys(authProfile)) {
        const incoming = (authProfile as any)[key];
        const existingVal = (existing as any)[key];
        if (existingVal === undefined || existingVal === null || existingVal === "") {
          update[key] = incoming;
        }
        // if existing value exists, keep it (do not override)
      }

      // Always ensure we don't overwrite hasWelcomeEmail here.
      // Use merge semantics by keeping this update object minimal.
      if (Object.keys(update).length > 0) {
        tx.set(userDocRef, update, { merge: true });
      } else if (!snap.exists()) {
        // if doc didn't exist and there is no meaningful incoming data, create a minimal doc
        tx.set(userDocRef, { createdAt: serverTimestamp() }, { merge: true });
      }
    });
  } catch (err) {
    console.error("upsertUserProfile error:", err);
  }
};

// Function to send welcome email for users who haven't received one
export const sendWelcomeMessage = async (user: User) => {
  try {
    // Get the user's name
    const userName = getUserName(user);

    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);
    const userData = snap.exists() ? snap.data() : {};

    // If hasWelcomeEmail is truthy, skip
    if (userData?.hasWelcomeEmail) {
      console.log(`User ${user.uid} already received welcome email.`);
      return;
    }

    // Do NOT write a false value to hasWelcomeEmail. Only set true after successful send.
    // Send welcome email
    await sendWelcomeEmail(userName, user.email!);

    // After successful send, mark as sent atomically (merge true so other fields remain untouched)
    await setDoc(userDocRef, { hasWelcomeEmail: true, welcomeSentAt: serverTimestamp() }, { merge: true });

    console.log(`Welcome email sent to ${user.email}`);
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      stack: error?.stack,
    });
    // do not overwrite hasWelcomeEmail on failure
  }
};

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Merge auth profile into Firestore (doesn't overwrite existing fields)
    await upsertUserProfile(user);

    // Send welcome email only if it hasn't been sent (function checks Firestore)
    await sendWelcomeMessage(user);
  }
});

export { app, auth, db };
