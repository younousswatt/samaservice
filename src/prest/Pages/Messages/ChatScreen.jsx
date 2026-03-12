import { useState, useEffect, useRef } from "react";
import { auth } from "../../../firebase";
import { sendMessage, listenMessages, markAsRead } from "../../../chatService";
import "./ChatScreen.css";

export default function PrestChatScreen({ chat, providerName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!chat?.id) return;
    markAsRead(chat.id, "provider").catch(() => {});
    const unsub = listenMessages(chat.id, setMessages);
    return () => unsub();
  }, [chat?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !chat?.id || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");
    try {
      await sendMessage(chat.id, uid, providerName || "Prestataire", msg, "provider");
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
      </div>

      <div className="chat-screen__messages">
        {messages.length === 0 ? (
          <div className="chat-screen__empty">
            <div className="chat-screen__empty-avatar">
              {chat?.clientName?.charAt(0).toUpperCase()}
            </div>
            <p className="chat-screen__empty-name">{chat?.clientName || "Client"}</p>
            <p className="chat-screen__empty-hint">Répondez au message de votre client 👋</p>
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

      <div className="chat-screen__input-row">
        <input
          className="chat-screen__input"
          type="text"
          placeholder="Écrivez votre réponse…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="chat-screen__send"
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
