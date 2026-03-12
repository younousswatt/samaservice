import {
  collection, doc, setDoc, addDoc, getDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, updateDoc, increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ── chatId stable : clientUid_providerUid ─────────────────────
export function getChatId(clientId, providerId) {
  return `${clientId}_${providerId}`;
}

// ── Créer ou récupérer une conversation ───────────────────────
export async function getOrCreateChat(clientId, clientName, providerId, providerName, providerPhone) {
  const chatId  = getChatId(clientId, providerId);
  const chatRef = doc(db, "chats", chatId);
  const snap    = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      clientId,
      clientName,
      providerId,
      providerName,
      providerPhone:  providerPhone || "",
      lastMessage:    "",
      lastAt:         serverTimestamp(),
      unreadClient:   0,
      unreadProvider: 0,
      createdAt:      serverTimestamp(),
    });
  }
  return chatId;
}

// ── Envoyer un message texte ──────────────────────────────────
export async function sendMessage(chatId, senderId, senderName, text, role) {
  if (!chatId || !senderId || !text?.trim()) {
    throw new Error("sendMessage: paramètres invalides");
  }

  // 1. Ajouter le message
  const msgRef = await addDoc(collection(db, "chats", chatId, "messages"), {
    type:      "text",
    text:      text.trim(),
    senderId,
    senderName,
    role,
    createdAt: serverTimestamp(),
  });

  // 2. Mettre à jour le chat
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text.length > 60 ? text.slice(0, 60) + "…" : text,
    lastAt:      serverTimestamp(),
    ...(role === "client"
      ? { unreadProvider: increment(1) }
      : { unreadClient:   increment(1) }),
  });

  return msgRef.id;
}

// ── Envoyer un devis (prestataire → client) ───────────────────
export async function sendQuote(chatId, providerId, providerName, { amount, description }) {
  if (!chatId || !amount) throw new Error("sendQuote: paramètres invalides");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    type:        "quote",
    amount,
    description: description || "",
    status:      "pending",   // pending | accepted | refused
    senderId:    providerId,
    senderName:  providerName,
    role:        "provider",
    createdAt:   serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage:    `💰 Devis : ${amount.toLocaleString("fr-FR")} FCFA`,
    lastAt:         serverTimestamp(),
    unreadClient:   increment(1),
  });
}

// ── Répondre à un devis (client) ──────────────────────────────
export async function respondToQuote(chatId, messageId, response, clientId, clientName) {
  // response : "accepted" | "refused"
  const msgRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(msgRef, { status: response });

  // Message système pour confirmer
  const label = response === "accepted" ? "✅ Devis accepté" : "❌ Devis refusé";
  await addDoc(collection(db, "chats", chatId, "messages"), {
    type:      "system",
    text:      label,
    senderId:  clientId,
    senderName: clientName,
    role:      "client",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage:    label,
    lastAt:         serverTimestamp(),
    unreadProvider: increment(1),
  });
}

// ── Écouter les messages en temps réel ────────────────────────
export function listenMessages(chatId, callback) {
  if (!chatId) return () => {};

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q,
    (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(msgs);
    },
    (err) => {
      console.error("listenMessages error:", err.code, err.message);
    }
  );
}

// ── Écouter les conversations d'un client ─────────────────────
export function listenClientChats(clientId, callback) {
  if (!clientId) return () => {};

  const q = query(
    collection(db, "chats"),
    where("clientId", "==", clientId),
    orderBy("lastAt", "desc")
  );

  return onSnapshot(q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err)  => console.error("listenClientChats error:", err.code, err.message)
  );
}

// ── Écouter les conversations d'un prestataire ────────────────
export function listenProviderChats(providerId, callback) {
  if (!providerId) return () => {};

  const q = query(
    collection(db, "chats"),
    where("providerId", "==", providerId),
    orderBy("lastAt", "desc")
  );

  return onSnapshot(q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err)  => console.error("listenProviderChats error:", err.code, err.message)
  );
}

// ── Marquer comme lu ──────────────────────────────────────────
export async function markAsRead(chatId, role) {
  if (!chatId) return;
  try {
    await updateDoc(doc(db, "chats", chatId), {
      ...(role === "client"
        ? { unreadClient:   0 }
        : { unreadProvider: 0 }),
    });
  } catch {}
}
