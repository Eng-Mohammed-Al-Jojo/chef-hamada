import { useState, useEffect } from "react";
import type { RefObject } from "react";
import { FaUtensils, FaMotorcycle } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

interface OrderTabsProps {
    onConfirm: (msg: string, type: "in" | "out") => void;
    firstInputRef?: RefObject<HTMLInputElement | null>;
    disableSend?: boolean;
    orderSettings?: {
        inRestaurant: boolean;
        takeaway: boolean;
        inPhone: string;
        outPhone: string;
    };
}

export default function OrderTabs({ onConfirm, firstInputRef, disableSend, orderSettings }: OrderTabsProps) {
    const { items, totalPrice } = useCart();

    // تحديد التاب الافتراضي حسب الإعدادات
    const [tab, setTab] = useState<"in" | "out">(() => {
        if (orderSettings?.inRestaurant) return "in";
        if (orderSettings?.takeaway) return "out";
        return "in";
    });

    const [form, setForm] = useState({
        name: "",
        table: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [error, setError] = useState<string | null>(null);

    // تعديل التاب تلقائياً إذا الخدمة غير مفعلة
    useEffect(() => {
        if (!orderSettings) return;

        if (tab === "in" && !orderSettings.inRestaurant && orderSettings.takeaway) {
            setTab("out");
        }
        if (tab === "out" && !orderSettings.takeaway && orderSettings.inRestaurant) {
            setTab("in");
        }
    }, [orderSettings]);

    const buildMessage = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("ar-EG");
        const timeStr = now.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });

        const list = items.map(i => `🔹 ${i.qty} × ${i.name} → ${Number(i.price) * i.qty}₪`).join("\n");

        if (tab === "in") {
            if (!form.name || !form.table) {
                setError("الرجاء إدخال اسم الزبون ورقم الطاولة");
                return;
            }
            return `✨ *طلب داخل المطعم* ✨
========================
${list}
========================

💰 *الإجمالي:* ${totalPrice}₪
========================

👤 *الاسم:* ${form.name}
🍽️ *رقم الطاولة:* ${form.table}
📝 *ملاحظات:* ${form.notes || "—"}

⏰ *وقت الطلب:* ${timeStr}
📅 *تاريخ الطلب:* ${dateStr}

💵 الدفع عند الكاشير
========================`;
        }

        if (!form.name || !form.phone || !form.address) {
            setError("الرجاء تعبئة جميع بيانات التيك أواي");
            return;
        }
        return `✨ *طلب تيك أواي* ✨
========================
${list}
========================

💰 *الإجمالي:* ${totalPrice}₪
👤 *الاسم:* ${form.name}
📱 *الجوال:* ${form.phone}
🏠 *العنوان:* ${form.address}
📝 *ملاحظات:* ${form.notes || "—"}

⏰ *وقت الطلب:* ${timeStr}
📅 *تاريخ الطلب:* ${dateStr}

💵 الدفع عند الاستلام
========================`;
    };

    const submit = () => {
        setError(null);
        const msg = buildMessage();
        if (msg) onConfirm(msg, tab);
    };

    const isCurrentTabActive = () => {
        if (tab === "in") return orderSettings?.inRestaurant;
        if (tab === "out") return orderSettings?.takeaway;
        return false;
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={() => orderSettings?.inRestaurant && setTab("in")}
                    disabled={!orderSettings?.inRestaurant}
                    className={`flex-1 py-2 rounded-full font-bold flex items-center justify-center gap-2
        ${tab === "in" ? "bg-[#FDB143]" : "bg-[#FDB143]/30"}
        ${!orderSettings?.inRestaurant ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FDB143]/80"}`}
                >
                    <FaUtensils /> داخل المطعم
                </button>

                <button
                    onClick={() => orderSettings?.takeaway && setTab("out")}
                    disabled={!orderSettings?.takeaway}
                    className={`flex-1 py-2 rounded-full font-bold flex items-center justify-center gap-2
        ${tab === "out" ? "bg-[#FDB143]" : "bg-[#FDB143]/30"}
        ${!orderSettings?.takeaway ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FDB143]/80"}`}
                >
                    <FaMotorcycle className="text-2xl" /> تيك أواي
                </button>
            </div>

            {!isCurrentTabActive() && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded-xl text-center">
                    {tab === "in" ? "الطلب داخل المطعم غير متاح حالياً" : "خدمة التيك أواي غير متاحة حالياً"}
                </div>
            )}

            {error && (
                <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded-xl text-center">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <input
                    ref={firstInputRef}
                    placeholder="اسم الزبون"
                    className={`w-full p-2 rounded-xl bg-black/30 ${!isCurrentTabActive() ? "opacity-50 cursor-not-allowed" : ""}`}
                    onChange={e => isCurrentTabActive() && setForm({ ...form, name: e.target.value })}
                    disabled={!isCurrentTabActive()}
                />
                {tab === "in" && (
                    <input
                        placeholder="رقم الطاولة"
                        className={`w-full p-2 rounded-xl bg-black/30 ${!orderSettings?.inRestaurant ? "opacity-50 cursor-not-allowed" : ""}`}
                        onChange={e => orderSettings?.inRestaurant && setForm({ ...form, table: e.target.value })}
                        disabled={!orderSettings?.inRestaurant}
                    />
                )}
                {tab === "out" && (
                    <>
                        <input
                            placeholder="رقم الجوال"
                            className={`w-full p-2 rounded-xl bg-black/30 ${!orderSettings?.takeaway ? "opacity-50 cursor-not-allowed" : ""}`}
                            onChange={e => orderSettings?.takeaway && setForm({ ...form, phone: e.target.value })}
                            disabled={!orderSettings?.takeaway}
                        />
                        <input
                            placeholder="العنوان"
                            className={`w-full p-2 rounded-xl bg-black/30 ${!orderSettings?.takeaway ? "opacity-50 cursor-not-allowed" : ""}`}
                            onChange={e => orderSettings?.takeaway && setForm({ ...form, address: e.target.value })}
                            disabled={!orderSettings?.takeaway}
                        />
                    </>
                )}
                <textarea
                    placeholder="ملاحظات (اختياري)"
                    className={`w-full p-2 rounded-xl bg-black/30 ${!isCurrentTabActive() ? "opacity-50 cursor-not-allowed" : ""}`}
                    onChange={e => isCurrentTabActive() && setForm({ ...form, notes: e.target.value })}
                    disabled={!isCurrentTabActive()}
                />
            </div>

            <button
                onClick={submit}
                disabled={disableSend || !isCurrentTabActive()}
                className={`w-full py-3 rounded-full bg-[#FDB143] font-bold hover:scale-105 transition
      ${disableSend || !isCurrentTabActive() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                تأكيد الطلب
            </button>
        </div>
    );
}
