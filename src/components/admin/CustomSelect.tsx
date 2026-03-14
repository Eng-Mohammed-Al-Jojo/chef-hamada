import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface Props {
    options: { id: string; name: string }[];
    value: string;
    onChange: (val: string) => void;
    error?: boolean;
    placeholder?: string;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    // تحديث موقع القائمة بالنسبة للشاشة
    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: rect.width,
            });
        }
    };

    // إغلاق عند النقر خارج dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            updateCoords();
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", updateCoords, true);
            window.removeEventListener("resize", updateCoords);
        };
    }, [open]);

    const selectedOption = options.find(o => o.id === value);

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef} dir="rtl">
            {/* الزر */}
            <button
                type="button"
                onClick={() => {
                    setOpen(!open);
                    updateCoords();
                }}
                onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
                className={`
                    w-full flex justify-between items-center px-4 py-2.5 border rounded-xl text-sm
                    ${error ? "border-red-500/50 bg-red-500/5 text-red-400" : "border-white/10 bg-white/5 text-white"} 
                    outline-none hover:border-gold/30 transition-all duration-300 group
                `}
            >
                <span className="font-semibold">
                    {selectedOption ? selectedOption.name : placeholder || "اختر"}
                </span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-white/30 group-hover:text-gold transition-colors"
                >
                    <FiChevronDown size={16} />
                </motion.span>
            </button>

            {/* القائمة */}
            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -8 }}
                            style={{
                                position: "fixed",
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 10001,
                            }}
                            className="rounded-xl bg-luxury-black/95 backdrop-blur-md shadow-2xl overflow-hidden"
                            dir="rtl"
                        >
                            <div className="max-h-60 overflow-y-auto scrollbar-none">
                                {options.length > 0 ? (
                                    options.map(o => (
                                        <button
                                            key={o.id}
                                            type="button"
                                            onClick={() => handleSelect(o.id)}
                                            className={`
                                                w-full text-right px-4 py-2.5 text-sm flex items-center justify-between transition-all duration-200
                                                ${value === o.id
                                                    ? "bg-gold text-luxury-black font-bold"
                                                    : "text-white/70 hover:bg-white/5 hover:text-white"}
                                            `}
                                        >
                                            <span>{o.name}</span>
                                            {value === o.id && <FiCheck size={14} />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-white/20 text-xs font-bold">
                                        لا توجد خيارات متاحة
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CustomSelect;