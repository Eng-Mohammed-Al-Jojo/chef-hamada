import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

interface Props {
  onAuthSuccess: () => void;
}

export default function AdminLogin({ onAuthSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");
  const [resetPasswordPopup, setResetPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const login = async () => {
    if (!email || !password) {
      setToast("أدخل البريد وكلمة المرور");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast("تم تسجيل الدخول بنجاح ✅");
      setTimeout(() => {
        setToast("");
        onAuthSuccess();
      }, 1000);
    } catch {
      setToast("بيانات الدخول غير صحيحة");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("أدخل البريد الإلكتروني أولاً");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!");
    } catch (err: any) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040309] font-[Cairo] p-4 relative overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FDB143]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#940D11]/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#FDB143] text-black px-8 py-3 rounded-2xl font-black shadow-2xl transition-all text-center min-w-[200px]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetPasswordPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel p-8 w-full max-w-sm border border-white/10 rounded-[2.5rem] shadow-2xl relative"
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#FDB143]/20 blur-2xl rounded-full" />
                  <img src="/hamada.png" alt="Logo" className="relative w-24 h-24 object-contain" />
                </div>
              </div>
              <h2 className="text-xl font-black mb-6 text-white text-center">
                إعادة تعيين كلمة المرور
              </h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                {resetMessage && (
                  <p className="text-sm text-center text-[#FDB143] font-bold animate-pulse">{resetMessage}</p>
                )}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-4 rounded-2xl bg-[#FDB143] text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  >
                    إرسال الرابط
                  </button>
                  <button
                    onClick={() => {
                      setResetPasswordPopup(false);
                      setResetMessage("");
                    }}
                    className="w-full py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      {!resetPasswordPopup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-panel p-8 md:p-10 w-full max-w-md border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col items-center"
        >
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-[#FDB143]/20 blur-3xl rounded-full transition-all group-hover:bg-[#FDB143]/30" />
            <img src="/hamada.png" alt="Logo" className="relative w-32 h-32 object-contain rounded-full drop-shadow-glow" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">لوحة تحكم الأدمن</h1>
            <div className="w-12 h-1 bg-[#FDB143] mx-auto rounded-full opacity-50" />
          </div>

          <div className="w-full space-y-5">
            <div className="space-y-4">
              <input
                type="email"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                onClick={login}
                className="w-full py-5 rounded-2xl bg-[#FDB143] text-black font-black text-lg shadow-xl shadow-[#FDB143]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => setResetPasswordPopup(true)}
                className="w-full mt-4 text-sm text-white/40 hover:text-[#FDB143] transition-colors font-medium text-center"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
