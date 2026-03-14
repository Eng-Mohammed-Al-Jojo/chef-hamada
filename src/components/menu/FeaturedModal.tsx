import { useEffect, useState } from "react";
import { FaTimes, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  show: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  star?: boolean;
  visible?: boolean;
}

export default function FeaturedModal({ show, onClose }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;

    const fetchStarItems = async () => {
      try {
        const snap = await get(ref(db, "items"));
        if (snap.exists()) {
          const data = snap.val();
          const starItems = Object.entries(data)
            .map(([id, item]: any) => ({ id, ...item }))
            .filter(item => item.star === true && item.visible !== false);
          setItems(starItems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStarItems();
  }, [show]);

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
            className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="relative p-8 pb-4">
              <button
                onClick={onClose}
                className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <FaTimes size={18} />
              </button>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                  <FaStar className="text-[#FDB143] animate-pulse" size={24} />
                  <h2 className="text-2xl md:text-3xl font-black text-gradient-gold uppercase">
                    الأصناف المميزة
                  </h2>
                  <FaStar className="text-[#FDB143] animate-pulse" size={24} />
                </div>
                <p className="text-white/40 text-sm font-light">مختارات الشيف المفضلة لك</p>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-8 pt-0">
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-[#FDB143]/20 border-t-[#FDB143] rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">جاري البحث عن التميز...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 text-white/30 italic">
                  لا توجد أصناف مميزة متوفرة حالياً
                </div>
              ) : (
                <div className="relative group/carousel">
                  <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4 pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="w-full shrink-0 snap-center">
                        <div className="glass-panel p-6 rounded-4xl border border-white/5 flex flex-col items-center">
                          {/* Image with Decorative Frame */}
                          <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#FDB143]/20 blur-3xl rounded-full" />
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/10 p-2 overflow-hidden bg-black shadow-2xl">
                              <img
                                src={item.image ? `/images/${item.image}` : `/hamada.png`}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                          </div>

                          <div className="text-center max-w-sm">
                            <h3 className="text-2xl font-black text-white mb-2">{item.name}</h3>
                            {item.description && (
                              <p className="text-white/60 text-sm font-light leading-relaxed mb-4">
                                {item.description}
                              </p>
                            )}
                            <div className="inline-block px-6 py-2 rounded-full bg-[#FDB143] text-black font-black text-xl shadow-lg">
                              {item.price}₪
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Hints */}
                  <div className="flex justify-center gap-2 mt-4">
                    {items.length > 1 && (
                      <div className="flex items-center gap-4 text-white/20 text-xs">
                        <FaChevronRight />
                        <span>اسحب للتصفح</span>
                        <FaChevronLeft />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
