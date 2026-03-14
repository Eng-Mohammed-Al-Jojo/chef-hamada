import { useState, useEffect } from "react";
import { FaTimes, FaStar, FaPaperPlane } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  show: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = "feedbackSettings";

export default function FeedbackModal({ show, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackPhone, setFeedbackPhone] = useState("");

  useEffect(() => {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const data = JSON.parse(localData);
      if (data.feedbackPhone) setFeedbackPhone(data.feedbackPhone);
    }

    const feedbackRef = ref(db, "settings/complaintsWhatsapp");
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const phone = snapshot.val();
        setFeedbackPhone(phone);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ feedbackPhone: phone }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!show) {
      setName("");
      setPhone("");
      setMessage("");
      setRating(0);
      setHoverRating(0);
    }
  }, [show]);

  const handleSend = () => {
    if (!message.trim()) {
      setToast("الرجاء كتابة الملاحظة ⚠️");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!feedbackPhone) {
      setToast("⚠️ رقم الشكاوى غير متوفر حالياً");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const fullMessage = `⭐ تقييم زبون ⭐
------------------
🔹 الاسم: ${name || "-"}
🔹 الجوال: ${phone || "-"}
🔹 التقييم: ${rating}/5
🔹 الملاحظة: ${message || "-"}`;

    const url = "https://wa.me/" + feedbackPhone + "?text=" + encodeURIComponent(fullMessage);
    window.open(url, "_blank");

    setToast("تم إرسال الملاحظة بنجاح ✅");
    setTimeout(() => setToast(null), 3000);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#040309]/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-1 bg-[#FDB143] rounded-full mb-6 opacity-50" />
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">الآراء و الشكاوى</h2>
              <p className="text-white/40 text-sm font-light text-center">
                نسعد بخدمتكم ونمتن لكل ملاحظة تصلنا ✨
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="الاسم (اختياري)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                />
                <input
                  type="tel"
                  placeholder="رقم الجوال (اختياري)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light text-right"
                />
              </div>

              {/* Star Rating */}
              <div className="py-4">
                <p className="text-center text-white/30 text-xs mb-4 uppercase tracking-[0.2em]">تقييمك يهمنا</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="relative focus:outline-none"
                    >
                      <FaStar
                        className={`w-8 h-8 transition-colors duration-300 ${star <= (hoverRating || rating) ? "text-[#FDB143] drop-shadow-glow" : "text-white/10"
                          }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="أخبرنا عن تجربتك... *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light resize-none h-32"
              />

              <button
                onClick={handleSend}
                className="w-full py-5 rounded-2xl bg-[#FDB143] text-black font-black text-lg shadow-xl shadow-[#FDB143]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span>إرسال عبر واتساب</span>
                <FaPaperPlane size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modern Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed top-8 right-8 z-60 bg-[#FDB143] text-black px-8 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-3"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
