import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (img: string) => void;
    galleryImages: string[];
    selectedImage?: string;
}

const FeaturedGallery: React.FC<Props> = ({ visible, onClose, onSelect, galleryImages, selectedImage }) => {
    // Render using React Portal to avoid stacking context issues from parents
    return createPortal(
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-9999 bg-luxury-black/95 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Content Wrapper */}
                    <div className="fixed inset-0 z-10000 flex items-start justify-center p-4 pt-16 md:pt-24 overflow-y-auto scrollbar-none pointer-events-none" dir="rtl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative glass-morphic w-full max-w-4xl rounded-2xl border border-white/5 p-5 md:p-8 mb-12 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-md pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white">اختر صورة للصنف</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:text-white transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Gallery Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-10 pb-2">
                                {galleryImages.map((img, index) => (
                                    <motion.button
                                        key={img}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        type="button"
                                        onClick={() => onSelect(img)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 group
                                            ${selectedImage === img ? "border-gold shadow-lg shadow-gold/20" : "border-white/5 hover:border-white/20 bg-white/5"}`}
                                    >
                                        <img
                                            src={`/images/${img}`}
                                            alt={img}
                                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {selectedImage === img && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute top-3 right-3 w-7 h-7 bg-gold text-luxury-black rounded-lg flex items-center justify-center shadow-lg"
                                            >
                                                <FiCheck size={16} className="font-bold" />
                                            </motion.div>
                                        )}
                                        <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-300" />
                                    </motion.button>
                                ))}
                            </div>

                            {/* Footer / Close Button */}
                            <div className="mt-10 relative z-10 pt-8 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-4 rounded-xl font-black bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em] active:scale-95"
                                >
                                    إغلاق المعرض
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default FeaturedGallery;