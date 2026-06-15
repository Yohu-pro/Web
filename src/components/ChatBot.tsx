import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Image as ImageIcon, Trash2, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SiteConfig, ChatMessage } from "../types";

export default function ChatBot({ config }: { config: SiteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetContext, setSheetContext] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith('vi'));
      if (viVoice) utterance.voice = viVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: "model", 
          content: "Xin chào! Tôi là Trợ lý tư vấn Yohu Việt Nam 👋\nTôi có thể giúp bạn:\n\n- Tư vấn chọn sản phẩm phù hợp (điều hòa, bồn nước, năng lượng mặt trời, thiết bị vệ sinh, thiết bị bếp...)\n- Tra cứu giá, thông số kỹ thuật\n- Hướng dẫn đặt hàng và chính sách bảo hành\n\nBạn có thể gửi ảnh sản phẩm để tôi tư vấn chính xác hơn. Bạn cần hỗ trợ gì hôm nay?" 
        }
      ]);
    }
    // Attempt to fetch price list context if admin is connected
    const token = sessionStorage.getItem("google_access_token") || "service_account";
    if (config.sheet_id) {
      fetchSheetContext(token);
    }
  }, [config.sheet_id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchSheetContext = async (token: string) => {
    if (!token || token === "null" || token === "undefined") return;
    try {
      const resp = await fetch("/api/sheets/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sheetId: config.sheet_id, 
          range: "San_pham!A1:N100", 
          accessToken: token 
        }),
      });
      
      if (!resp.ok) {
        // If San_pham fails, try the generic Don_Hang_Chi_Tiet or just let it fail silently
        // as the server-side will handle context if service account is present.
        return;
      }

      const data = await resp.json();
      if (data.values && Array.isArray(data.values)) {
        const text = data.values.map((row: any[]) => row.join(" | ")).join("\n");
        setSheetContext("Bảng giá tài chính:\n" + text.substring(0, 3000));
      }
    } catch (err: any) {
      // Only log if it's not a common expected error
      if (err?.name !== 'AbortError') {
        console.warn("💡 ChatBot: Sheet context fetch skipped or inaccessible via current session token.");
      }
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg: ChatMessage = { 
      role: "user", 
      content: input || (selectedImage ? "Đã gửi một hình ảnh." : "")
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", currentInput);
      formData.append("apiKey", config.gemini_api_key || "");
      if (sheetContext) formData.append("sheetContext", sheetContext);
      if (currentImage) formData.append("image", currentImage);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: "model", content: data.text }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: "model", content: `Lỗi: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Chatbot Chăm sóc khách hàng</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              <div className="text-center py-4 bg-white/50 rounded-3xl border border-slate-100 mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vui lòng hỏi bất kỳ điều gì bạn cần</p>
              </div>

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-slate-200" : "bg-blue-600 text-white"}`}>
                    {msg.role === "user" ? <UserIcon className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className={`p-5 rounded-3xl text-sm shadow-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    }`}>
                      <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-blue-600">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.role === "model" && (
                      <button 
                        onClick={() => speakText(msg.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all uppercase tracking-widest shadow-sm"
                      >
                        <Volume2 className={`w-3 h-3 ${isSpeaking ? "animate-pulse text-blue-600" : ""}`} />
                        <span>Nghe phản hồi</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Container */}
            <div className="p-6 bg-white border-t border-slate-100">
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img src={imagePreview} className="h-20 w-20 object-cover rounded-2xl border-2 border-blue-500" alt="Preview" />
                  <button 
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-end gap-3"
              >
                <div className="flex-grow flex items-center bg-slate-100 rounded-3xl px-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi bất kỳ điều gì bạn cần..."
                    className="flex-grow py-4 bg-transparent text-sm focus:outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || loading}
                  className="p-4 bg-blue-600 text-white rounded-3xl disabled:opacity-30 hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <div className="flex flex-col items-center">
            <Bot className="w-9 h-9" />
          </div>
        )}
        {!isOpen && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xl border border-white flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Chat Bán Hàng
          </span>
        )}
        {!isOpen && (
          <span className="absolute right-full mr-6 px-5 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl uppercase tracking-[0.2em] translate-x-4 group-hover:translate-x-0">
            Hỏi AI Yohu
          </span>
        )}
      </motion.button>
    </div>
  );
}
