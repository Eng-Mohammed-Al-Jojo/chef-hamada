import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
  createdAt?: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  priceTw?: number;
  categoryId: string;
  visible?: boolean;
  star?: boolean; // جديد: الأصناف المميزة
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
  onFeaturedCheck?: (hasFeatured: boolean) => void; // جديد: يرسل إذا يوجد صنف مميز
}

export default function Menu({ onLoadingChange, onFeaturedCheck }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);
  const [orderSystem, setOrderSystem] = useState<boolean>(true);

  /* ================= Load Backup JSON ================= */
  const loadMenuJson = async () => {
    try {
      const res = await fetch("/menu.json");
      const data = await res.json();

      const cats: Category[] = Object.entries(data.categories || {}).map(
        ([id, v]: any) => ({
          id,
          name: v.name,
          available: v.available !== false,
          order: v.order ?? 0,
          createdAt: v.createdAt || 0,
        })
      ).sort((a, b) => a.order - b.order);

      const its: Item[] = Object.entries(data.items || {}).map(
        ([id, v]: any) => ({
          id,
          ...v,
          createdAt: v.createdAt || 0,
        })
      );

      setCategories(cats);
      setItems(its);
      setOrderSystem(data.orderSystem ?? true);
      setLoading(false);
      onLoadingChange?.(false);

      setToast({ message: "تم تحميل نسخة احتياطية", color: "red" });
      setTimeout(() => setToast(null), 4000);
    } catch {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  /* ================= useEffect ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;

    /* ====== Firebase Finish ====== */
    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);
      setLoading(false);
      onLoadingChange?.(false);
      if (timeoutId) clearTimeout(timeoutId);

      setToast({ message: "تم التحميل من قاعدة البيانات", color: "green" });
      setTimeout(() => setToast(null), 3000);
    };

    /* ================= Online Load ================= */
    const loadOnline = () => {
      let cats: Category[] = [];
      let its: Item[] = [];
      let catsLoaded = false;
      let itemsLoaded = false;
      let orderSystemLoaded = false;

      /* ====== Timeout Fallback ====== */
      timeoutId = window.setTimeout(() => {
        if (firebaseLoaded) return;

        const cached = loadFromLocal();
        if (cached) {
          setCategories(cached.categories || []);
          setItems(cached.items || []);
          setOrderSystem(cached.orderSystem ?? true);
          setLoading(false);
          onLoadingChange?.(false);

          setToast({ message: "الإنترنت ضعيف، تم تحميل آخر نسخة محفوظة", color: "red" });
          setTimeout(() => setToast(null), 4000);
        } else {
          loadMenuJson();
        }
      }, 8000);

      /* ====== Categories ====== */
      onValue(ref(db, "categories"), (snap) => {
        const data = snap.val();
        cats = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            name: v.name,
            available: v.available !== false,
            order: v.order ?? 0,
            createdAt: v.createdAt || 0,
          }))
          : [];
        cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(cats);
        catsLoaded = true;
        if (itemsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      /* ====== Items ====== */
      onValue(ref(db, "items"), (snap) => {
        const data = snap.val();
        its = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            ...v,
            createdAt: v.createdAt || 0,
          }))
          : [];
        setItems(its);
        itemsLoaded = true;
        if (catsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      /* ====== OrderSystem ====== */
      onValue(ref(db, "settings/orderSystem"), (snap) => {
        const val = snap.val();
        setOrderSystem(val ?? true);
        orderSystemLoaded = true;
        if (catsLoaded && itemsLoaded) finishFirebase(cats, its, val ?? true);
      });
    };

    if (navigator.onLine) loadOnline();
    else loadMenuJson();
  }, [onLoadingChange]);

  /* ================= Check Featured Items ================= */
  useEffect(() => {
    const hasFeatured = items.some(item => item.star === true);
    onFeaturedCheck?.(hasFeatured);
  }, [items, onFeaturedCheck]);

  /* ========= Filter Available Categories ========= */
  const availableCategories = categories.filter((cat) => cat.available);

  /* ========= Loading UI ========= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[url('/bg.jpg')] md:bg-[url('/bg4.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

        <div className="relative z-10 flex flex-col items-center px-12 py-14 rounded-[3rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_80px_rgba(253,177,67,0.25)]">
          <div className="absolute -inset-8 rounded-[4rem] bg-[#FDB143]/10 blur-3xl animate-pulse" />

          <div className="relative w-48 h-48 mb-10">
            <img
              src="/hamada.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full shadow-2xl animate-floatSlow"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-widest text-[#F7F3E8]">
            تحضير التجربة
          </h2>

          <div className="w-24 h-[2px] bg-[#FDB143]/70 rounded-full my-5" />

          <p className="text-[#F7F3E8]/70 text-lg font-[Cairo] text-center">
            الفن يحتاج لحظة صبر
          </p>
        </div>
      </div>
    );
  }

  /* ========= Main Menu UI ========= */
  return (
    <main className="max-w-4xl mx-auto px-0 pb-10 space-y-10 font-[Alamiri] text-[#F5F8F7]">
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-2xl font-bold shadow-2xl z-50 text-white transition
          ${toast.color === "green" ? "bg-[#FDB143]" : "bg-[#940D11]"}`}
        >
          {toast.message}
        </div>
      )}

      {/* ===== Check if there are items ===== */}
      {items.length === 0 || (activeCategory && items.filter(i => i.categoryId === activeCategory).length === 0) ? (
        <p className="text-center text-[#F5F8F7]/70 text-lg font-[Cairo] mt-10">
          لا توجد أصناف حالياً
        </p>
      ) : (
        <>
          {/* ===== Filter Tabs ===== */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-2xl font-bold transition font-[Cairo]
              ${activeCategory === null
                  ? "bg-[#FDB143] text-[#040309] text-md px-3 py-2"
                  : "bg-[#F5F8F7] text-[#040309]/80 text-xs px-2 py-1"
                }`}
            >
              جميع الأصناف
            </button>

            {availableCategories
              .filter((cat) => items.some((i) => i.categoryId === cat.id))
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-2xl font-bold transition font-[Cairo]
                  ${activeCategory === cat.id
                      ? "bg-[#FDB143] text-[#040309] text-md px-3 py-2"
                      : "bg-[#F5F8F7] text-[#040309]/80 text-xs px-2 py-1"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* ===== Sections ===== */}
          {(activeCategory
            ? availableCategories.filter((c) => c.id === activeCategory)
            : availableCategories
          ).map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                items={catItems}
                orderSystem={orderSystem}
              />
            );
          })}
        </>
      )}
    </main>
  );
}
