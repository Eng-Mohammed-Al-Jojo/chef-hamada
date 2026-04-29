import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";
import { motion, AnimatePresence } from "framer-motion";

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
  createdAt?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  price: number | string;
  ingredients?: string;
  priceTw?: number | string;
  categoryId: string;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
}

/* ================= LocalStorage ================= */
const saveToLocal = (cats: Category[], its: Item[], orderSystem: boolean) => {
  localStorage.setItem(
    "menu_cache",
    JSON.stringify({
      categories: cats,
      items: its,
      orderSystem,
      savedAt: Date.now(),
    })
  );
};

const loadFromLocal = () => {
  const cached = localStorage.getItem("menu_cache");
  if (!cached) return null;
  return JSON.parse(cached);
};

/* ================= Main Component ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
}

export default function Menu({ onLoadingChange, onFeaturedCheck }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);
  const [orderSystem, setOrderSystem] = useState<boolean>(true);
  const [renderLimit, setRenderLimit] = useState(2); // Batch rendering limit

  const showGlobalToast = (message: string, color: "green" | "red" = "green") => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 2500);
  };

  /* ================= Load Online ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;

    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);
      setLoading(false);
      onLoadingChange?.(false);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const loadOnline = () => {
      const unsubs: (() => void)[] = [];

      unsubs.push(
        onValue(ref(db, "categories"), (snap) => {
          const data = snap.val();
          const cats = data
            ? Object.entries(data).map(([id, v]: any) => ({
              id,
              ...v,
              available: v.available !== false,
            }))
            : [];
          cats.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          setCategories(cats);
          if (firebaseLoaded) saveToLocal(cats, items, orderSystem);
        })
      );

      unsubs.push(
        onValue(ref(db, "items"), (snap) => {
          const data = snap.val();
          const its = data
            ? Object.entries(data).map(([id, v]: any) => ({
              id,
              ...v,
            }))
            : [];
          setItems(its);
          if (firebaseLoaded) saveToLocal(categories, its, orderSystem);
        })
      );

      unsubs.push(
        onValue(ref(db, "settings/orderSystem"), (snap) => {
          const val = snap.val();
          setOrderSystem(val ?? true);
          if (firebaseLoaded) saveToLocal(categories, items, val ?? true);
        })
      );

      // Simple sync check to stop loading
      unsubs.push(
        onValue(ref(db, ".info/connected"), (snap) => {
          if (snap.val() === true) {
            setTimeout(() => finishFirebase(categories, items, orderSystem), 1000);
          }
        })
      );

      return () => {
        unsubs.forEach((unsub) => unsub());
      };
    };

    let cleanup: (() => void) | undefined;
    if (navigator.onLine) {
      cleanup = loadOnline();
    } else {
      const cached = loadFromLocal();
      if (cached) {
        setCategories(cached.categories);
        setItems(cached.items);
        setOrderSystem(cached.orderSystem);
        setLoading(false);
        onLoadingChange?.(false);
      }
    }

    return () => {
      if (cleanup) cleanup();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const hasFeatured = items.some(item => item.star === true);
    onFeaturedCheck?.(hasFeatured);
  }, [items, onFeaturedCheck]);

  const availableCategories = categories.filter((cat) => cat.available);
  const scrollCategories = availableCategories.filter((cat) => items.some((i) => i.categoryId === cat.id));

  // Pre-calculate items per category for better performance
  const categoryItemsMap = useMemo(() => {
    const map: Record<string, Item[]> = {};
    items.forEach(item => {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    });
    return map;
  }, [items]);

  // Progressive rendering logic
  useEffect(() => {
    if (!loading && renderLimit < availableCategories.length) {
      const timer = setTimeout(() => {
        setRenderLimit(prev => Math.min(prev + 2, availableCategories.length));
      }, 150); // Load 2 more categories every 150ms
      return () => clearTimeout(timer);
    }
  }, [loading, renderLimit, availableCategories.length]);

  // Reset limit when changing category tab
  useEffect(() => {
    setRenderLimit(2);
  }, [activeCategory]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#040309] font-[Cairo]"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FDB143]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#940D11]/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center px-8 py-12 rounded-[2.5rem] glass-panel border border-white/10 shadow-2xl"
        >
          <div className="relative w-32 h-32 mb-8">
            <motion.img
              initial={{ y: 0 }}
              animate={{ y: -10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
              src="/hamada.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full drop-shadow-[0_0_15px_rgba(253,177,67,0.3)]"
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Chef Hamada
          </h2>
          <div className="w-12 h-1 bg-linear-to-r from-transparent via-[#FDB143] to-transparent rounded-full mb-6" />
          <p className="text-white/60 text-sm md:text-base font-light tracking-wide animate-pulse">
            جاري التحضير لتجربة طعام لا تنسى
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto  pb-20 space-y-12 font-[Almarai] text-white overflow-x-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 right-8 px-6 py-3 rounded-2xl font-bold shadow-2xl z-50 text-white border border-white/10 backdrop-blur-md
            ${toast.color === "green" ? "bg-[#FDB143]/90 text-black" : "bg-[#940D11]/90"}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8">
        <div className="flex flex-col items-center mb-10">

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-black text-gradient-gold uppercase tracking-wider"
          >
          </motion.h1>
          <div className="w-56 h-1 bg-linear-to-r from-transparent via-[#FDB143] to-transparent rounded-full mt-4" />

        </div>

        {/* Category Tabs - Fully Wrapping Modern UI, Styled like ItemRow */}
        <div className="sticky top-4 z-40 py-4 px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 p-2 rounded-3xl
                  bg-linear-to-br from-[#0b0a0e]/90 to-[#040309]/95
                  border border-[#FDB143]/30 shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(253,177,67,0.05)]">

            {/* All Categories */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`relative px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold transition-all duration-300
        ${activeCategory === null
                  ? "text-black z-10"
                  : "text-white/60 hover:text-white hover:bg-[#FFD369]/10"}`
              }
            >
              {activeCategory === null && (
                <motion.div
                  layoutId="activeTabMenu"
                  className="absolute inset-0 bg-linear-to-r from-[#FDB143] to-[#FFD369] hover:from-[#FFD369] hover:to-[#FDB143] rounded-2xl -z-10 shadow-[0_4px_15px_rgba(253,177,67,0.3)] border border-[#FDB143]/50"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              جميع الأصناف
            </button>

            {scrollCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold transition-all duration-300
          ${activeCategory === cat.id
                    ? "text-black z-10"
                    : "text-white/60 hover:text-white hover:bg-[#FFD369]/10"}`
                }
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activeTabMenu"
                    className="absolute inset-0 bg-linear-to-r from-[#FDB143] to-[#FFD369] rounded-2xl -z-10 shadow-[0_4px_15px_rgba(253,177,67,0.3)] border border-[#FDB143]/50"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {items.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/50 text-lg font-light py-20"
          >
            لا توجد أصناف حالياً
          </motion.p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory || "all"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {(activeCategory
                ? availableCategories.filter((c) => c.id === activeCategory)
                : availableCategories.slice(0, renderLimit)
              ).map((cat) => {
                const catItems = categoryItemsMap[cat.id] || [];
                if (!catItems.length) return null;

                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    items={catItems}
                    orderSystem={orderSystem}
                    showGlobalToast={showGlobalToast}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
