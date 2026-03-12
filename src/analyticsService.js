import {
  doc, collection, addDoc, getDocs,
  query, where, orderBy, limit,
  updateDoc, increment, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Incrémenter les vues d'un prestataire ─────────────────────
export async function incrementProviderView(providerId) {
  try {
    await updateDoc(doc(db, "providers", providerId), {
      views: increment(1),
    });
  } catch {}
}

// ── Incrémenter les appels ────────────────────────────────────
export async function incrementProviderCall(providerId) {
  try {
    await updateDoc(doc(db, "providers", providerId), {
      calls: increment(1),
    });
  } catch {}
}

// ── Enregistrer une prestation (transaction) ──────────────────
export async function addTransaction(providerId, { label, amount, icon = "🔧" }) {
  await addDoc(collection(db, "providers", providerId, "transactions"), {
    label,
    amount,   // nombre (FCFA)
    icon,
    createdAt: serverTimestamp(),
  });
  // Mettre à jour le total revenus
  await updateDoc(doc(db, "providers", providerId), {
    totalEarnings: increment(amount),
    totalJobs:     increment(1),
  });
}

// ── Récupérer les analytics d'un prestataire ─────────────────
export async function getProviderAnalytics(providerId) {
  const snap = await getDoc(doc(db, "providers", providerId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    views:         d.views         || 0,
    calls:         d.calls         || 0,
    rating:        d.rating        || null,
    reviews:       d.reviews       || 0,
    totalEarnings: d.totalEarnings || 0,
    totalJobs:     d.totalJobs     || 0,
    available:     d.available     ?? true,
    verified:      d.verified      || false,
    plan:          d.plan          || "free",
  };
}

// ── Récupérer les dernières transactions ──────────────────────
export async function getRecentTransactions(providerId, count = 5) {
  const q = query(
    collection(db, "providers", providerId, "transactions"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Revenus des 7 derniers jours (pour le graphique) ─────────
export async function getEarningsLast7Days(providerId) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "providers", providerId, "transactions"),
    where("createdAt", ">=", since),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  // Initialiser les 7 derniers jours à 0
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("fr-FR", { weekday: "short" });
    days[key] = 0;
  }

  snap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.createdAt?.toDate) {
      const key = data.createdAt.toDate().toLocaleDateString("fr-FR", { weekday: "short" });
      if (key in days) days[key] += data.amount || 0;
    }
  });

  return Object.entries(days).map(([day, amount]) => ({ day, amount }));
}
