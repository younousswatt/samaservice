import {
  collection, addDoc, getDocs,
  query, where, updateDoc, doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
 
// ── Vérifier si le client a déjà noté ce prestataire ─────────
export async function hasAlreadyReviewed(clientId, providerId) {
  const q = query(
    collection(db, "providers", providerId, "reviews"),
    where("clientId", "==", clientId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
 
// ── Soumettre un avis ─────────────────────────────────────────
export async function submitReview(clientId, clientName, providerId, { rating, comment }) {
  await addDoc(collection(db, "providers", providerId, "reviews"), {
    clientId,
    clientName,
    rating,
    comment: comment || "",
    createdAt: serverTimestamp(),
  });
 
  // Recalculer la note moyenne
  const reviewsSnap = await getDocs(collection(db, "providers", providerId, "reviews"));
  const allRatings  = reviewsSnap.docs.map((d) => d.data().rating || 0);
  const avg         = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
 
  await updateDoc(doc(db, "providers", providerId), {
    rating:  Math.round(avg * 10) / 10,
    reviews: allRatings.length,
  });
}
 
// ── Récupérer les avis d'un prestataire ──────────────────────
export async function getReviews(providerId) {
  const snap = await getDocs(collection(db, "providers", providerId, "reviews"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}