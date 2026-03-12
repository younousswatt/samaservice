import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../../firebase";
import {
  getOrCreateChat, sendMessage,
  listenMessages, markAsRead,
} from "../../chatService";
import "./ChatScreen.css";

export default function ChatScreen({ provider, clientName, onBack }) {
  const [chatId,   setChatId]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const [sending,  setSending]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const bottomRef = useRef(null);

  const uid = auth.currentUser?.uid;

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
    } catch {}
    setLoading(false);
  }, [uid, provider?.id, provider?.name, provider?.phone, clientName]);

  useEffect(() => { initChat(); }, [initChat]);

  useEffect(() => {
    if (!chatId) return;
    markAsRead(chatId, "client").catch(() => {});
    const unsub = listenMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !chatId || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");
    try {
      await sendMessage(chatId, uid, clientName || "Client", msg, "client");
    } catch {
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
        </div>
      </div>

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
          messages.map((msg) => {
            const isMe = msg.senderId === uid;
            return (
              <div key={msg.id} className={`chat-bubble ${isMe ? "chat-bubble--me" : "chat-bubble--them"}`}>
                <div className="chat-bubble__text">{msg.text}</div>
                <div className="chat-bubble__time">{formatTime(msg.createdAt)}</div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-screen__input-row">
        <input
          className="chat-screen__input"
          type="text"
          placeholder="Écrivez un message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          className="chat-screen__send"
          onClick={handleSend}
          disabled={!text.trim() || sending || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
