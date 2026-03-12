import {
  collection, doc, setDoc, addDoc, getDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, updateDoc, increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Générer un chatId unique et stable ────────────────────────
// Format : clientUid_providerUid (toujours dans cet ordre)
export function getChatId(clientId, providerId) {
  return `${clientId}_${providerId}`;
}

// ── Créer ou récupérer une conversation ───────────────────────
export async function getOrCreateChat(clientId, clientName, providerId, providerName, providerPhone) {
  const chatId = getChatId(clientId, providerId);
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(chatRef, {
      clientId,
      clientName,
      providerId,
      providerName,
      providerPhone: providerPhone || "",
      lastMessage:   "",
      lastAt:        serverTimestamp(),
      unreadClient:  0,
      unreadProvider: 0,
      createdAt:     serverTimestamp(),
    });
  }
  return chatId;
}

// ── Envoyer un message ────────────────────────────────────────
export async function sendMessage(chatId, senderId, senderName, text, role) {
  const msgRef = collection(db, "chats", chatId, "messages");
  await addDoc(msgRef, {
    text,
    senderId,
    senderName,
    role,        // "client" | "provider"
    createdAt:   serverTimestamp(),
  });

  // Mettre à jour lastMessage + incrémenter unread de l'autre
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text.length > 60 ? text.slice(0, 60) + "…" : text,
    lastAt:      serverTimestamp(),
    // Incrémenter le compteur non-lu de l'autre partie
    ...(role === "client"
      ? { unreadProvider: increment(1) }
      : { unreadClient:   increment(1) }),
  });
}

// ── Écouter les messages d'une conversation (temps réel) ──────
export function listenMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

// ── Écouter les conversations d'un client ─────────────────────
export function listenClientChats(clientId, callback) {
  const q = query(
    collection(db, "chats"),
    where("clientId", "==", clientId),
    orderBy("lastAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
}

// ── Écouter les conversations d'un prestataire ────────────────
export function listenProviderChats(providerId, callback) {
  const q = query(
    collection(db, "chats"),
    where("providerId", "==", providerId),
    orderBy("lastAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
}

// ── Marquer comme lu ──────────────────────────────────────────
export async function markAsRead(chatId, role) {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    ...(role === "client"
      ? { unreadClient:   0 }
      : { unreadProvider: 0 }),
  });
}
