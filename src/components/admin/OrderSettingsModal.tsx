import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiSettings, FiPhone, FiMapPin, FiMessageSquare, FiFacebook, FiInstagram, FiSmartphone, FiCheckCircle } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

/* ================= Service Checkbox ================= */
function ServiceCard({
    title,
    enabled,
    onToggle,
    value,
    setValue,
    disabled,
    icon: Icon,
}: any) {
    return (
        <div className={`glass-card p-4 rounded-2xl border transition-all duration-300 ${enabled ? "border-[#FDB143]/30 bg-white/5" : "border-white/5 opacity-60"}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? "bg-[#FDB143] text-black" : "bg-white/5 text-white/20"}`}>
                        <Icon size={20} />
                    </div>
                    <span className="font-black text-white">{title}</span>
                </div>
                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? "bg-[#FDB143]" : "bg-white/10"}`}
                >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${enabled ? "translate-x-6" : ""}`} />
                </button>
            </div>

            <AnimatePresence>
                {enabled && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2">
                            <div className="relative">
                                <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input
                                    type="tel"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                                    placeholder="رقم الواتساب (بدون +)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#FDB143]/50 transition-all font-light"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({
    setShowOrderSettings,
    orderSettings: initialSettings,
    onSave,
}: {
    setShowOrderSettings: (v: boolean) => void;
    orderSettings: any;
    onSave: (newSettings: any) => void;
}) {
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({
        address: "",
        phone: "",
        altPhone: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!initialSettings) return;
        setOrderSystem(initialSettings.orderSystem ?? true);
        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");
        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    const handleSave = async () => {
        const newSettings = {
            orderSystem,
            orderSettings: { inRestaurant, takeaway, inPhone, outPhone },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            onSave?.(newSettings);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setShowOrderSettings(false);
            }, 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 overflow-hidden" dir="rtl">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOrderSettings(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative glass-panel w-full max-w-lg max-h-[90vh] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDB143]/10 flex items-center justify-center text-[#FDB143]">
                            <FiSettings size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">إعدادات النظام</h2>
                            <p className="text-[10px] text-white/30 font-light tracking-widest uppercase">General System Configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowOrderSettings(false)}
                        className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:bg-[#940D11]/20 hover:text-[#940D11] transition-all flex items-center justify-center"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
                    {/* Order System Toggle */}
                    <div className={`p-6 rounded-4xl transition-all border duration-300 ${orderSystem ? "bg-[#FDB143]/5 border-[#FDB143]/20" : "bg-white/5 border-white/5"}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${orderSystem ? "bg-[#FDB143] text-black shadow-lg shadow-[#FDB143]/20" : "bg-white/5 text-white/20"}`}>
                                    <FiSmartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">نظام الطلب الإلكتروني</h3>
                                    <p className="text-xs text-white/30 font-light">تفعيل أو تعطيل استقبال الطلبات عبر التطبيق</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOrderSystem((p) => !p)}
                                className={`relative w-16 h-8 rounded-full transition-all duration-500 ${orderSystem ? "bg-[#FDB143]" : "bg-white/10"}`}
                            >
                                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${orderSystem ? "translate-x-8" : ""}`} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ServiceCard
                            title="الطلب داخل المطعم"
                            enabled={inRestaurant}
                            onToggle={() => setInRestaurant((p) => !p)}
                            value={inPhone}
                            setValue={setInPhone}
                            disabled={!orderSystem}
                            icon={FiCheckCircle}
                        />
                        <ServiceCard
                            title="تيك أواي / خارجي"
                            enabled={takeaway}
                            onToggle={() => setTakeaway((p) => !p)}
                            value={outPhone}
                            setValue={setOutPhone}
                            disabled={!orderSystem}
                            icon={FiMessageSquare}
                        />
                    </div>

                    {/* Complaints */}
                    <div className="glass-card p-6 rounded-4xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[#940D11]/10 flex items-center justify-center text-[#940D11]">
                                <FiAlertTriangle className="animate-pulse" size={20} />
                            </div>
                            <h4 className="font-black text-white">خط الشكاوى والمقترحات</h4>
                        </div>
                        <div className="relative">
                            <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                value={complaintsWhatsapp}
                                onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                placeholder="رقم واتساب الشكاوى..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 py-4 text-white placeholder:text-white/10 outline-none focus:border-[#FDB143]/50 transition-all font-light"
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="glass-card p-6 rounded-4xl border border-white/10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                <FiMapPin size={20} />
                            </div>
                            <h4 className="font-black text-white">معلومات تذييل الصفحة (الفوتر)</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input placeholder="العنوان التجاري بالكامل" value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input placeholder="رقم الهاتف الأساسي" value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                                <div className="relative">
                                    <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input placeholder="رقم موبايل بديل" value={footer.altPhone} onChange={(e) => setFooter({ ...footer, altPhone: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <FiFacebook className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/50" size={16} />
                                    <input placeholder="Facebook URL" value={footer.facebook} onChange={(e) => setFooter({ ...footer, facebook: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                                <div className="relative">
                                    <FiInstagram className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400/50" size={16} />
                                    <input placeholder="Instagram URL" value={footer.instagram} onChange={(e) => setFooter({ ...footer, instagram: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                                <div className="relative">
                                    <FaTiktok className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input placeholder="TikTok URL" value={footer.tiktok} onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                                <div className="relative">
                                    <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400/50" size={16} />
                                    <input placeholder="واتساب مباشر" value={footer.whatsapp} onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-white text-sm outline-none focus:border-[#FDB143]/30" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="px-8 py-6 border-t border-white/5 bg-white/2">
                    <button
                        onClick={handleSave}
                        disabled={saving || showSuccess}
                        className="w-full h-16 rounded-3xl bg-[#FDB143] text-black font-black text-lg shadow-xl shadow-[#FDB143]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : showSuccess ? (
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                <FiCheckCircle size={24} />
                                <span>تم الحفظ بنجاح</span>
                            </motion.div>
                        ) : (
                            <>
                                <FiSave size={22} />
                                <span>حفظ جميع الإعدادات</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function FiAlertTriangle(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m10.29 3.86 7.22 12.42a2 2 0 0 1-1.72 3.06H4.21a2 2 0 0 1-1.72-3.06l7.22-12.42a2 2 0 0 1 3.58 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
