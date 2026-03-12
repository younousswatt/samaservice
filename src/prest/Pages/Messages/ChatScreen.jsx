import { useState, useEffect, useRef } from "react";
import { auth } from "../../../firebase";
import { sendMessage, listenMessages, markAsRead, sendQuote } from "../../../chatService";
import "./ChatScreen.css";

export default function PrestChatScreen({ chat, providerName, onBack }) {
  const [messages,   setMessages]   = useState([]);
  const [text,       setText]       = useState("");
  const [sending,    setSending]    = useState(false);
  const [sendError,  setSendError]  = useState("");
  const [showQuote,  setShowQuote]  = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDesc,  setQuoteDesc]  = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);
  const bottomRef = useRef(null);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!chat?.id) return;
    markAsRead(chat.id, "provider");
    const unsub = listenMessages(chat.id, setMessages);
    return () => unsub();
  }, [chat?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !chat?.id || sending) return;
    setSending(true);
    setSendError("");
    setText("");
    try {
      await sendMessage(chat.id, uid, providerName || "Prestataire", trimmed, "provider");
    } catch (err) {
      console.error("Erreur envoi:", err);
      setText(trimmed);
      setSendError("Impossible d'envoyer. Vérifiez votre connexion.");
    } finally {
      setSending(false);
    }
  };

  const handleSendQuote = async () => {
    const amount = parseInt(quoteAmount.replace(/\D/g, ""), 10);
    if (!amount || amount <= 0) return;
    setSendingQuote(true);
    try {
      await sendQuote(chat.id, uid, providerName || "Prestataire", {
        amount,
        description: quoteDesc.trim(),
      });
      setShowQuote(false);
      setQuoteAmount("");
      setQuoteDesc("");
    } catch (err) {
      console.error("Erreur devis:", err);
    } finally {
      setSendingQuote(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = (msg) => {
    const isMe = msg.senderId === uid;

    if (msg.type === "system") {
      return (
        <div key={msg.id} className="chat-system-msg">{msg.text}</div>
      );
    }

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
          {msg.status === "pending" && (
            <div className="chat-quote__status chat-quote__status--pending">⏳ En attente de validation</div>
          )}
          {msg.status === "accepted" && (
            <div className="chat-quote__status chat-quote__status--ok">✅ Devis accepté — vous pouvez commencer !</div>
          )}
          {msg.status === "refused" && (
            <div className="chat-quote__status chat-quote__status--no">❌ Devis refusé par le client</div>
          )}
        </div>
      );
    }

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
            {chat?.clientName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="chat-screen__name">{chat?.clientName || "Client"}</div>
            <div style={{ fontSize: "0.75rem", color: "#ACC8A2" }}>Client</div>
          </div>
        </div>
        {/* Bouton devis */}
        <button
          className="chat-screen__action-btn chat-screen__action-btn--quote"
          onClick={() => setShowQuote(true)}
          title="Envoyer un devis"
        >
          💰
        </button>
      </div>

      {/* Modal devis */}
      {showQuote && (
        <div className="quote-modal__overlay" onClick={(e) => e.target === e.currentTarget && setShowQuote(false)}>
          <div className="quote-modal__sheet">
            <div className="quote-modal__handle" />
            <div className="quote-modal__title">Envoyer un devis 💰</div>
            <div className="quote-modal__subtitle">
              Le client devra accepter avant que vous commenciez
            </div>

            <div className="quote-modal__field">
              <label className="quote-modal__label">Montant (FCFA)</label>
              <input
                className="quote-modal__input"
                type="number"
                placeholder="Ex : 15000"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                autoFocus
                min="0"
              />
            </div>

            <div className="quote-modal__field">
              <label className="quote-modal__label">Description (optionnel)</label>
              <input
                className="quote-modal__input"
                type="text"
                placeholder="Ex : Réparation fuite sous évier"
                value={quoteDesc}
                onChange={(e) => setQuoteDesc(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="quote-modal__actions">
              <button
                className="quote-modal__btn-send"
                onClick={handleSendQuote}
                disabled={!quoteAmount || parseInt(quoteAmount) <= 0 || sendingQuote}
              >
                {sendingQuote ? "Envoi…" : "Envoyer le devis ➤"}
              </button>
              <button
                className="quote-modal__btn-cancel"
                onClick={() => { setShowQuote(false); setQuoteAmount(""); setQuoteDesc(""); }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-screen__messages">
        {messages.length === 0 ? (
          <div className="chat-screen__empty">
            <div className="chat-screen__empty-avatar">
              {chat?.clientName?.charAt(0).toUpperCase()}
            </div>
            <p className="chat-screen__empty-name">{chat?.clientName || "Client"}</p>
            <p className="chat-screen__empty-hint">
              Répondez au message de votre client 👋
            </p>
            <p className="chat-screen__empty-hint" style={{ fontSize: "0.78rem", marginTop: "8px" }}>
              Appuyez sur 💰 pour envoyer un devis
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Erreur */}
      {sendError && (
        <div className="chat-screen__send-error">{sendError}</div>
      )}

      {/* Input */}
      <div className="chat-screen__input-row">
        <input
          className="chat-screen__input"
          type="text"
          placeholder="Écrivez votre réponse…"
          value={text}
          onChange={(e) => { setText(e.target.value); setSendError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button
          className="chat-screen__send"
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? "…" : "➤"}
        </button>
      </div>
    </div>
  );
}
