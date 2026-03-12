import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { listenClientChats, markAsRead } from "../../chatService";
import "./ConversationsList.css";

export default function ConversationsList({ onOpenChat }) {
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = listenClientChats(uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    const d   = ts.toDate();
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60)    return "À l'instant";
    if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const handleOpen = (chat) => {
    markAsRead(chat.id, "client").catch(() => {});
    onOpenChat(chat);
  };

  return (
    <div className="convos">
      <div className="convos__header">
        <div className="convos__title">Messages 💬</div>
        <div className="convos__subtitle">
          {loading ? "Chargement…" :
            chats.length > 0
              ? `${chats.length} conversation${chats.length > 1 ? "s" : ""}`
              : "Aucune conversation"}
        </div>
      </div>

      {loading ? (
        <div className="convos__loading">
          <div className="convos__spinner" />
        </div>
      ) : chats.length === 0 ? (
        <div className="convos__empty">
          <span className="convos__empty-icon">💬</span>
          <div className="convos__empty-title">Aucun message</div>
          <div className="convos__empty-desc">
            Ouvrez le profil d'un prestataire et appuyez sur Chat pour démarrer.
          </div>
        </div>
      ) : (
        <div className="convos__list">
          {chats.map((chat) => {
            const unread = chat.unreadClient || 0;
            return (
              <div
                key={chat.id}
                className={`convo-item ${unread > 0 ? "convo-item--unread" : ""}`}
                onClick={() => handleOpen(chat)}
              >
                <div className="convo-item__avatar">
                  {chat.providerName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="convo-item__content">
                  <div className="convo-item__top">
                    <span className="convo-item__name">{chat.providerName}</span>
                    <span className="convo-item__time">{formatTime(chat.lastAt)}</span>
                  </div>
                  <div className="convo-item__bottom">
                    <span className="convo-item__last">
                      {chat.lastMessage || "Démarrer la conversation…"}
                    </span>
                    {unread > 0 && (
                      <span className="convo-item__badge">{unread}</span>
                    )}
                  </div>
                  {chat.providerPhone && (
                    <div className="convo-item__phone">{chat.providerPhone}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
