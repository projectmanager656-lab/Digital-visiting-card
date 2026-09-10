// ---------------------------------------------------------------------------
// Card data store — Firestore backend.
//
// This used to run on localStorage (see git history). It now talks to the
// Firebase Firestore "cards" collection. Every exported function keeps its
// original name, signature, and return shape, so nothing in the
// pages/components that call this module needs to change.
// ---------------------------------------------------------------------------

import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
} from "firebase/firestore";

const CARDS = collection(db, "cards");

// Firestore doesn't hand back the doc id as a field, so every read path
// stitches `id` onto the data before returning it.
function toRecord(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function getAllCards() {
  const q = query(CARDS, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(toRecord).map(withDefaults);
}

export async function getCardBySlug(slug) {
  const q = query(CARDS, where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return withDefaults(toRecord(snap.docs[0]));
}

export async function getCardById(id) {
  const snap = await getDoc(doc(db, "cards", id));
  return snap.exists() ? withDefaults(toRecord(snap)) : null;
}

export async function isSlugTaken(slug, excludingId) {
  const q = query(CARDS, where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== excludingId);
}

export async function saveCard(card) {
  const { id, ...fields } = card;

  if (!id) {
    const record = {
      ...fields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      downloads: fields.downloads || 0,
    };
    const ref = await addDoc(CARDS, record);
    // serverTimestamp() resolves once the write is confirmed server-side;
    // return a client-side stand-in so the caller has a usable value now.
    return { id: ref.id, ...record, createdAt: Date.now(), updatedAt: Date.now() };
  }

  const ref = doc(db, "cards", id);
  const record = { ...fields, updatedAt: serverTimestamp() };
  await setDoc(ref, record, { merge: true });
  return { id, ...record, updatedAt: Date.now() };
}

export async function deleteCard(id) {
  await deleteDoc(doc(db, "cards", id));
}

export async function bumpViewCount(slug) {
  const q = query(CARDS, where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return;
  await updateDoc(snap.docs[0].ref, { views: increment(1) });
}

export async function bumpDownloadCount(slug) {
  const q = query(CARDS, where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return;
  await updateDoc(snap.docs[0].ref, { downloads: increment(1) });
}

// Merges a saved record with the current field defaults, so cards saved
// before a new field existed (e.g. specializations, verified) still render
// safely instead of throwing on undefined.
export function withDefaults(card) {
  const blank = blankCard();
  return {
    ...blank,
    ...card,
    fields: { ...blank.fields, ...(card.fields || {}) },
    socialStats: { ...blank.socialStats, ...(card.socialStats || {}) },
    specializations: card.specializations && card.specializations.length ? card.specializations : blank.specializations,
    customFields: card.customFields && card.customFields.length ? card.customFields : blank.customFields,
    appearance: { ...blank.appearance, ...(card.appearance || {}) },
  };
}

// Short, stable "#AASHA-104"-style badge derived from the record id, purely
// cosmetic — mirrors the reference design's card identifier chip.
export function cardIdBadge(id) {
  if (!id) return "NEW";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return `AASHA-${(hash % 900) + 100}`;
}

// Blank record shape, also serves as documentation of the data model.
export function blankCard() {
  return {
    id: null,
    slug: "",
    theme: "indigo",
    fields: {
      designation: true,
      businessName: true,
      photo: true,
      logo: true,
      phone: true,
      whatsapp: true,
      email: true,
      address: true,
      directions: true,
      tagline: true,
      hours: false,
      reviews: false,
      instagram: true,
      facebook: false,
      linkedin: false,
      website: false,
      specializations: false,
    },
    name: "",
    designation: "",
    businessName: "",
    categoryTag: "",
    photoUrl: "",
    logoUrl: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    tagline: "",
    hours: "",
    openNow: false,
    verified: false,
    reviewsUrl: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    website: "",
    socialStats: { instagram: "", facebook: "", linkedin: "", website: "", reviews: "" },
    specializations: [
      { title: "", description: "" },
      { title: "", description: "" },
      { title: "", description: "" },
    ],
    customFields: [],
    appearance: {
      viewCounter: true,
      offlineScanQr: true,
      googleReviewsBadge: false,
      footerTag: true,
    },
    industry: "",
    status: "active", // active | draft | archived
    downloads: 0,
  };
}

// A fresh custom field row, e.g. a UPI handle, a catalog download, a gallery link.
export function blankCustomField() {
  return { id: crypto.randomUUID(), icon: "link", label: "", value: "", enabled: true };
}