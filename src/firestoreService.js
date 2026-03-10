import {
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, getDocs,
  arrayUnion, arrayRemove,
  serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// ══════════════════════════════════════════════════════════════
// CATALOGUE COMPLET DES SERVICES (Business Plan)
// ══════════════════════════════════════════════════════════════
export const ALL_SERVICES = [
  // Bâtiment & Travaux
  { id: "plombier",      label: "Plombier",        category: "Bâtiment & Travaux",   icon: "🔧" },
  { id: "electricien",   label: "Électricien",      category: "Bâtiment & Travaux",   icon: "⚡" },
  { id: "macon",         label: "Maçon",            category: "Bâtiment & Travaux",   icon: "🧱" },
  { id: "peintre",       label: "Peintre",          category: "Bâtiment & Travaux",   icon: "🎨" },
  { id: "menuisier",     label: "Menuisier",        category: "Bâtiment & Travaux",   icon: "🪵" },
  { id: "climaticien",   label: "Climaticien",      category: "Bâtiment & Travaux",   icon: "❄️" },
  // Services à domicile
  { id: "femme_menage",  label: "Femme de ménage",  category: "Services à domicile",  icon: "🧹" },
  { id: "cuisinier",     label: "Cuisinier",        category: "Services à domicile",  icon: "👨‍🍳" },
  { id: "babysitter",    label: "Babysitter",       category: "Services à domicile",  icon: "👶" },
  { id: "coiffeur",      label: "Coiffeur",         category: "Services à domicile",  icon: "💇" },
  { id: "jardinier",     label: "Jardinier",        category: "Services à domicile",  icon: "🌿" },
  { id: "chauffeur",     label: "Chauffeur",        category: "Services à domicile",  icon: "🚗" },
  // Artisanat
  { id: "couturier",     label: "Couturier",        category: "Artisanat",            icon: "🧵" },
  { id: "cordonnier",    label: "Cordonnier",       category: "Artisanat",            icon: "👟" },
  { id: "tisserand",     label: "Tisserand",        category: "Artisanat",            icon: "🪡" },
  { id: "bijoutier",     label: "Bijoutier",        category: "Artisanat",            icon: "💍" },
  { id: "tapissier",     label: "Tapissier",        category: "Artisanat",            icon: "🛋️" },
];

// ══════════════════════════════════════════════════════════════
// PRESTATAIRES DE TEST (autour de Dakar)
// ══════════════════════════════════════════════════════════════
const TEST_PROVIDERS = [
  { id: "test_001", name: "Aliou Badji",       phone: "+221770001001", service: "Plombier",        serviceId: "plombier",    rating: 4.8, reviews: 24, available: true,  lat: 14.6980, lng: -17.4420, quartier: "Mermoz",              ville: "Dakar" },
  { id: "test_002", name: "Moussa Sow",        phone: "+221770001002", service: "Électricien",     serviceId: "electricien", rating: 4.6, reviews: 18, available: true,  lat: 14.6850, lng: -17.4550, quartier: "Plateau",              ville: "Dakar" },
  { id: "test_003", name: "Diallo Kouyaté",    phone: "+221770001003", service: "Maçon",           serviceId: "macon",       rating: 4.5, reviews: 31, available: false, lat: 14.7020, lng: -17.4380, quartier: "Pikine",               ville: "Dakar" },
  { id: "test_004", name: "Fatou Mbaye",       phone: "+221770001004", service: "Jardinier",       serviceId: "jardinier",   rating: 4.9, reviews: 12, available: true,  lat: 14.6910, lng: -17.4600, quartier: "Almadies",             ville: "Dakar" },
  { id: "test_005", name: "Ibrahima Ndiaye",   phone: "+221770001005", service: "Électricien",     serviceId: "electricien", rating: 4.7, reviews: 9,  available: true,  lat: 14.6760, lng: -17.4490, quartier: "Grand Yoff",           ville: "Dakar" },
  { id: "test_006", name: "Aminata Diop",      phone: "+221780001006", service: "Peintre",         serviceId: "peintre",     rating: 4.4, reviews: 15, available: false, lat: 14.7100, lng: -17.4300, quartier: "Sacré-Cœur",           ville: "Dakar" },
  { id: "test_007", name: "Cheikh Touré",      phone: "+221780001007", service: "Cuisinier",       serviceId: "cuisinier",   rating: 5.0, reviews: 7,  available: true,  lat: 14.6820, lng: -17.4700, quartier: "Yoff",                 ville: "Dakar" },
  { id: "test_008", name: "Marième Cissé",     phone: "+221780001008", service: "Couturier",       serviceId: "couturier",   rating: 4.3, reviews: 20, available: true,  lat: 14.6950, lng: -17.4350, quartier: "HLM",                  ville: "Dakar" },
  { id: "test_009", name: "Omar Fall",         phone: "+221770001009", service: "Menuisier",       serviceId: "menuisier",   rating: 4.6, reviews: 11, available: true,  lat: 14.6890, lng: -17.4510, quartier: "Médina",               ville: "Dakar" },
  { id: "test_010", name: "Aïssatou Diallo",   phone: "+221770001010", service: "Femme de ménage", serviceId: "femme_menage",rating: 4.8, reviews: 33, available: true,  lat: 14.7050, lng: -17.4250, quartier: "Parcelles Assainies",  ville: "Dakar" },
  { id: "test_011", name: "Mamadou Lamine",    phone: "+221780001011", service: "Climaticien",     serviceId: "climaticien", rating: 4.5, reviews: 8,  available: false, lat: 14.6720, lng: -17.4620, quartier: "Guédiawaye",           ville: "Dakar" },
  { id: "test_012", name: "Rokhaya Gaye",      phone: "+221780001012", service: "Coiffeur",        serviceId: "coiffeur",    rating: 4.9, reviews: 42, available: true,  lat: 14.6800, lng: -17.4480, quartier: "Liberté",              ville: "Dakar" },
  { id: "test_013", name: "Pape Demba Sarr",   phone: "+221770001013", service: "Chauffeur",       serviceId: "chauffeur",   rating: 4.7, reviews: 16, available: true,  lat: 14.6930, lng: -17.4650, quartier: "Ngor",                 ville: "Dakar" },
  { id: "test_014", name: "Ndèye Fall",        phone: "+221780001014", service: "Babysitter",      serviceId: "babysitter",  rating: 4.6, reviews: 6,  available: true,  lat: 14.6860, lng: -17.4390, quartier: "Point E",              ville: "Dakar" },
  { id: "test_015", name: "Saliou Diagne",     phone: "+221770001015", service: "Cordonnier",      serviceId: "cordonnier",  rating: 4.2, reviews: 28, available: true,  lat: 14.6750, lng: -17.4560, quartier: "Dieuppeul",            ville: "Dakar" },
  { id: "test_016", name: "Binta Koné",        phone: "+221780001016", service: "Tapissier",       serviceId: "tapissier",   rating: 4.4, reviews: 5,  available: false, lat: 14.7130, lng: -17.4420, quartier: "Ouakam",               ville: "Dakar" },
  { id: "test_017", name: "Abdoulaye Ba",      phone: "+221770001017", service: "Tisserand",       serviceId: "tisserand",   rating: 4.8, reviews: 14, available: true,  lat: 14.6990, lng: -17.4280, quartier: "Gueule Tapée",         ville: "Dakar" },
  { id: "test_018", name: "Khady Sarr",        phone: "+221780001018", service: "Bijoutier",       serviceId: "bijoutier",   rating: 4.7, reviews: 9,  available: true,  lat: 14.6870, lng: -17.4740, quartier: "Fann",                 ville: "Dakar" },
];

// ══════════════════════════════════════════════════════════════
// SEED — Insérer les prestataires test dans Firestore
// (à appeler UNE SEULE FOIS depuis l'app ou la console)
// ══════════════════════════════════════════════════════════════
export async function seedTestProviders() {
  const batch = writeBatch(db);
  TEST_PROVIDERS.forEach((p) => {
    const ref = doc(db, "providers", p.id);
    batch.set(ref, {
      name:       p.name,
      phone:      p.phone,
      service:    p.service,
      serviceId:  p.serviceId,
      rating:     p.rating,
      reviews:    p.reviews,
      available:  p.available,
      lat:        p.lat,
      lng:        p.lng,
      quartier:   p.quartier,
      ville:      p.ville,
      verified:   true,
      isTest:     true,
      createdAt:  serverTimestamp(),
    }, { merge: true });
  });
  await batch.commit();
  console.log("✅ 18 prestataires test insérés dans Firestore");
}

// ══════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════
export async function saveUser(uid, { name, phone, role }) {
  await setDoc(doc(db, "users", uid), {
    name,
    phone,
    role,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ══════════════════════════════════════════════════════════════
// PROVIDERS
// ══════════════════════════════════════════════════════════════
export async function saveProvider(uid, data) {
  await setDoc(doc(db, "providers", uid), {
    ...data,
    available:  data.available  ?? true,
    verified:   data.verified   ?? false,
    rating:     data.rating     ?? 0,
    reviews:    data.reviews    ?? 0,
    isTest:     false,
    updatedAt:  serverTimestamp(),
  }, { merge: true });
}

export async function saveProviderLocation(uid, locationData) {
  // locationData : { lat, lng, address, quartier, ville, gpsEnabled }
  await setDoc(doc(db, "providers", uid), {
    ...locationData,
    locationUpdatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getProvider(uid) {
  const snap = await getDoc(doc(db, "providers", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllProviders() {
  const snap = await getDocs(collection(db, "providers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAvailability(uid, available) {
  await updateDoc(doc(db, "providers", uid), { available });
}

// ══════════════════════════════════════════════════════════════
// FAVORITES
// ══════════════════════════════════════════════════════════════
export async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "favorites", uid));
  return snap.exists() ? snap.data().providerIds || [] : [];
}

export async function addFavorite(uid, providerId) {
  await setDoc(doc(db, "favorites", uid), {
    providerIds: arrayUnion(providerId),
  }, { merge: true });
}

export async function removeFavorite(uid, providerId) {
  try {
    await updateDoc(doc(db, "favorites", uid), {
      providerIds: arrayRemove(providerId),
    });
  } catch {
    // Document n'existe pas encore
  }
}

// ══════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════
export async function addReview(providerId, { clientName, rating, text }) {
  await addDoc(collection(db, "providers", providerId, "reviews"), {
    clientName,
    rating,
    text,
    date: serverTimestamp(),
  });

  const reviewsSnap = await getDocs(collection(db, "providers", providerId, "reviews"));
  const all = reviewsSnap.docs.map((d) => d.data());
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;

  await updateDoc(doc(db, "providers", providerId), {
    rating:  Math.round(avg * 10) / 10,
    reviews: all.length,
  });
}

export async function getReviews(providerId) {
  const snap = await getDocs(collection(db, "providers", providerId, "reviews"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
