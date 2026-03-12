import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../../firebase";
import {
  getOrCreateChat, sendMessage,
  listenMessages, markAsRead, respondToQuote,
} from "../../chatService";
import { hasAlreadyReviewed } from "../../reviewService";
import RatingModal from "./RatingModal";
import "./ChatScreen.css";

export default function ChatScreen({ provider, clientName, onBack }) {
  const [chatId,     setChatId]     = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [text,       setText]       = useState("");
  const [sending,    setSending]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [sendError,  setSendError]  = useState("");
  const [showRating, setShowRating] = useState(false);
  const [canRate,    setCanRate]    = useState(false);
  const bottomRef = useRef(null);

  const uid = auth.currentUser?.uid;

  // ── Initialiser le chat ───────────────────────────────────
  const initChat = useCallback(async () => {
    if (!uid || !provider?.id) return;
    try {
      const id = await getOrCreateChat(
        uid,
        clientName || "Client",
        provider.id,
        provider.name,
        provider.phone || ""
      );
      setChatId(id);
      const already = await hasAlreadyReviewed(uid, provider.id).catch(() => false);
      setCanRate(!already);
    } catch (err) {
      console.error("initChat error:", err);
    }
    setLoading(false);
  }, [uid, provider?.id, provider?.name, provider?.phone, clientName]);

  useEffect(() => { initChat(); }, [initChat]);

  // ── Écouter les messages ──────────────────────────────────
  useEffect(() => {
    if (!chatId) return;
    markAsRead(chatId, "client");
    const unsub = listenMessages(chatId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [chatId]);

  // ── Scroll bas ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Envoyer message ───────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !chatId || sending) return;

    setSending(true);
    setSendError("");
    setText(""); // vider immédiatement pour fluidité

    try {
      await sendMessage(chatId, uid, clientName || "Client", trimmed, "client");
    } catch (err) {
      console.error("Erreur envoi:", err);
      setText(trimmed); // remettre le texte si erreur
      setSendError("Impossible d'envoyer. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  };

  // ── Répondre à un devis ───────────────────────────────────
  const handleQuoteResponse = async (messageId, response) => {
    if (!chatId) return;
    try {
      await respondToQuote(chatId, messageId, response, uid, clientName || "Client");
    } catch (err) {
      console.error("Erreur réponse devis:", err);
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const providerReplied = messages.some((m) => m.senderId === provider?.id);
  const showRateBtn     = canRate && providerReplied && messages.length >= 2;

  // ── Rendu d'une bulle ─────────────────────────────────────
  const renderMessage = (msg) => {
    const isMe = msg.senderId === uid;

    // Message système
    if (msg.type === "system") {
      return (
        <div key={msg.id} className="chat-system-msg">
          {msg.text}
        </div>
      );
    }

    // Bulle devis
    if (msg.type === "quote") {
      return (
        <div key={msg.id} className={`chat-quote ${isMe ? "chat-quote--me" : ""}`}>
          <div className="chat-quote__header">💰 Devis proposé</div>
          <div className="chat-quote__amount">
            {(msg.amount || 0).toLocaleString("fr-FR")} FCFA
          </div>
          {msg.description && (
            <div className="chat-quote__desc">{msg.description}</div>
          )}
          <div className="chat-quote__time">{formatTime(msg.createdAt)}</div>

          {/* Boutons accepter/refuser — uniquement pour le client si encore en attente */}
          {msg.status === "pending" && !isMe && (
            <div className="chat-quote__actions">
              <button
                className="chat-quote__btn chat-quote__btn--accept"
                onClick={() => handleQuoteResponse(msg.id, "accepted")}
              >
                ✅ Accepter
              </button>
              <button
                className="chat-quote__btn chat-quote__btn--refuse"
                onClick={() => handleQuoteResponse(msg.id, "refused")}
              >
                ❌ Refuser
              </button>
            </div>
          )}
          {msg.status === "accepted" && (
            <div className="chat-quote__status chat-quote__status--ok">✅ Devis accepté</div>
          )}
          {msg.status === "refused" && (
            <div className="chat-quote__status chat-quote__status--no">❌ Devis refusé</div>
          )}
        </div>
      );
    }

    // Bulle texte normale
    return (
      <div key={msg.id} className={`chat-bubble ${isMe ? "chat-bubble--me" : "chat-bubble--them"}`}>
        <div className="chat-bubble__text">{msg.text}</div>
        <div className="chat-bubble__time">{formatTime(msg.createdAt)}</div>
      </div>
    );
  };

  return (
    <div className="chat-screen">

      {/* Header */}
      <div className="chat-screen__header">
        <button className="chat-screen__back" onClick={onBack}>←</button>
        <div className="chat-screen__header-info">
          <div className="chat-screen__avatar">
            {provider?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="chat-screen__name">{provider?.name}</div>
            {provider?.phone && (
              <div className="chat-screen__phone">
                <a href={`tel:${provider.phone}`}>{provider.phone}</a>
              </div>
            )}
          </div>
        </div>
        <div className="chat-screen__header-actions">
          {provider?.phone && (
            <>
              <a href={`tel:${provider.phone}`} className="chat-screen__action-btn">📞</a>
              <a href={`sms:${provider.phone}`}  className="chat-screen__action-btn">💬</a>
            </>
          )}
          {showRateBtn && (
            <button
              className="chat-screen__action-btn chat-screen__action-btn--rate"
              onClick={() => setShowRating(true)}
            >⭐</button>
          )}
        </div>
      </div>

      {/* Bannière notation */}
      {showRateBtn && (
        <button className="chat-screen__rate-banner" onClick={() => setShowRating(true)}>
          ⭐ La prestation s'est bien passée ? Laisser un avis →
        </button>
      )}

      {/* Messages */}
      <div className="chat-screen__messages">
        {loading ? (
          <div className="chat-screen__loading">
            <div className="chat-screen__spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-screen__empty">
            <div className="chat-screen__empty-avatar">
              {provider?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="chat-screen__empty-name">{provider?.name}</p>
            <p className="chat-screen__empty-service">{provider?.service}</p>
            {provider?.phone && (
              <p className="chat-screen__empty-phone">{provider.phone}</p>
            )}
            <p className="chat-screen__empty-hint">
              Envoyez un message pour démarrer la conversation 👋
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Erreur envoi */}
      {sendError && (
        <div className="chat-screen__send-error">{sendError}</div>
      )}

      {/* Input */}
      <div className="chat-screen__input-row">
        <input
          className="chat-screen__input"
          type="text"
          placeholder="Écrivez un message…"
          value={text}
          onChange={(e) => { setText(e.target.value); setSendError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={loading}
        />
        <button
          className="chat-screen__send"
          onClick={handleSend}
          disabled={!text.trim() || sending || loading}
        >
          {sending ? "…" : "➤"}
        </button>
      </div>

      {/* Modal notation */}
      {showRating && (
        <RatingModal
          provider={provider}
          clientName={clientName}
          onClose={() => setShowRating(false)}
          onSubmitted={() => setCanRate(false)}
        />
      )}
    </div>
  );
}
