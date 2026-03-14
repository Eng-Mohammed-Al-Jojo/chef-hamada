import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiStar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { PopupState, Category, Item } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect";

/* ================== auto load feature images from public/featured ================== */
const galleryImages = Object.keys(
  import.meta.glob("/public/images/*")
).map((path) => path.replace("/public/images/", ""));
/* ================================================================== */

interface Props {
  categories: Record<string, Category>;
  items: Record<string, Item>;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const ItemSection: React.FC<Props> = ({ categories, items, setPopup }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemIngredients, setItemIngredients] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ================== Gallery state ==================
  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");

  // ================== Local state for items ==================
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ================== Firebase updates ==================
  const addItem = async () => {
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemName.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "",
      star: false,
    });

    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
    setItemImage("");

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await update(ref(db, `items/${galleryForItemId}`), { image: img });
    setShowGallery(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#FDB143]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="mb-10 text-center md:text-right">
        <h2 className="text-2xl font-black text-white mb-2">إدارة الأصناف</h2>
        <p className="text-white/40 text-sm font-light">أضف منتجات جديدة وقم بإدارتها بسهولة وشغف ✨</p>
      </div>

      {/* ================== إضافة صنف ================== */}
      <div className="glass-card p-6 rounded-2xl border-black/5 bg-black/5 mb-10 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-1">
            <CustomSelect
              options={Object.keys(categories).map(id => ({ id, name: categories[id].name }))}
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setSelectedCategoryError(false); }}
              error={selectedCategoryError}
              placeholder="اختر القسم الأساسي *"
            />
            {selectedCategoryError && <span className="text-xs md:text-sm text-red-400 font-bold px-2">يجب اختيار قسم</span>}
          </div>

          <div className="space-y-1">
            <input
              className={`w-full px-5 py-4 bg-white/5 text-sm md:text-base border rounded-2xl text-white placeholder:text-white/20 focus:outline-none transition-all font-light
                ${itemNameError ? "border-red-500/50" : "border-white/10 focus:border-[#FDB143]/50"}`}
              placeholder="اسم الصنف الجديد *"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setItemNameError(false); }}
            />
            {itemNameError && <span className="text-xs text-red-400 font-bold px-2">يجب إدخال اسم</span>}
          </div>

          <div className="md:col-span-2">
            <textarea
              className="w-full px-5 py-4 bg-white/5 border text-sm md:text-base border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light resize-none h-24"
              placeholder="المكونات أو وصف قصير (اختياري)..."
              value={itemIngredients}
              onChange={(e) => setItemIngredients(e.target.value)}
            />
          </div>

          <div className="md:col-span-1 space-y-1">
            <input
              className={`w-full px-5 py-4 bg-white/5 border text-sm md:text-base rounded-2xl text-white placeholder:text-white/20 focus:outline-none transition-all font-light
                ${itemPriceError ? "border-red-500/50" : "border-white/10 focus:border-[#FDB143]/50"}`}
              placeholder="الأسعار (مثال: 15, 20) *"
              value={itemPrice}
              onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
            />
            {itemPriceError && <span className="text-xs text-red-400 font-bold px-2">يجب إدخال سعر صحيح</span>}
          </div>

          <div className="md:col-span-1">
            <button
              onClick={addItem}
              className="w-full h-auto py-4 rounded-2xl bg-[#FDB143] text-black font-black text-base md:text-lg shadow-xl shadow-[#FDB143]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FiPlus size={20} />
              <span>إضافة الصنف</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-[#FDB143] flex items-center justify-center z-10"
            >
              <span className="text-black font-black text-xl">✨ تم الحفظ بنجاح ✨</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================== البحث ================== */}
      <div className="relative mb-8 group">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FDB143] transition-colors">
          <FiSearch size={22} />
        </div>
        <input
          className="w-full pr-14 pl-5 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/30 transition-all font-light"
          placeholder="البحث السريع في القائمة..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
      </div>

      {/* ================== الأقسام والمواد ================== */}
      <div className="space-y-4">
        {Object.keys(categories).map(catId => {
          const cat = categories[catId];
          const catItems = Object.keys(localItems)
            .map(id => ({ ...localItems[id], id }))
            .filter(item => item.categoryId === catId)
            .filter(item => {
              const search = quickSearch.toLowerCase();
              return (
                item.name.toLowerCase().includes(search) ||
                cat.name.toLowerCase().includes(search) ||
                String(item.price).split(",").some(p => p.includes(search))
              );
            });

          if (quickSearch && catItems.length === 0) return null;

          return (
            <div key={catId} className="glass-card border border-white/5 rounded-3xl overflow-hidden">
              <div
                className="flex justify-between items-center cursor-pointer px-6 py-5 bg-white/5 hover:bg-white/10 transition-colors group/header"
                onClick={() => toggleSection(catId)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 transition-transform duration-500 ${expandedSections[catId] ? "rotate-180" : ""}`}>
                    <FiChevronDown />
                  </div>
                  <span className="text-md md:text-lg font-black text-white">{cat.name}</span>
                  <span className="bg-[#FDB143]/10 text-[#FDB143] text-[10px] font-black px-3 py-1 rounded-full border border-[#FDB143]/20 uppercase tracking-wider">
                    {catItems.length} صنف
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections[catId] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 space-y-2 bg-white/1">
                      {catItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className={`flex flex-col md:flex-row justify-between items-center px-5 py-4 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/6 transition-all gap-4
                            ${!item.visible ? "opacity-30 grayscale-50" : ""}`}
                        >
                          <div className="flex items-start md:items-center gap-5 flex-1 min-w-0 w-full">

                            {/* Image */}
                            <div className="relative group/img w-16 h-16 shrink-0 aspect-square">
                              <div
                                className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center cursor-pointer"
                                onClick={() => openGallery(item.id, item.image)}
                              >
                                {item.image ? (
                                  <img
                                    src={`/images/${item.image}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                                    onError={(e) => {
                                      e.currentTarget.src = "/hamada.png";
                                    }}
                                  />
                                ) : (
                                  <div className="text-white/10 group-hover/img:text-[#FDB143] transition-colors">
                                    <FiPlus size={24} />
                                  </div>
                                )}
                              </div>

                              {item.image && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeImage(item.id); }}
                                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg scale-0 group-hover/img:scale-100"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-white text-sm md:text-base leading-snug wrap-break-word">
                                {item.name}
                              </p>

                              {item.ingredients && (
                                <p className="text-white/30 text-xs leading-relaxed mt-1 wrap-break-word">
                                  {item.ingredients}
                                </p>
                              )}

                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[#FDB143] font-black text-sm md:text-base">
                                  {item.price}₪
                                </span>

                                {item.priceTw && (
                                  <span className="text-[10px] bg-[#FDB143]/10 text-[#FDB143] border border-[#FDB143]/10 px-2 py-0.5 rounded-full font-bold uppercase">
                                    T.W {item.priceTw}₪
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleItem(item.id, item.visible)}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border
                                ${item.visible
                                  ? "bg-green-500/10 text-green-400 border-green-500/10 hover:bg-green-500 hover:text-white"
                                  : "bg-white/5 text-white/20 border-white/5 hover:bg-white/10 hover:text-white"}`}
                            >
                              {item.visible ? "نشط" : "مخفي"}
                            </button>

                            <div className="w-px h-6 bg-white/5 mx-1" />

                            <button
                              onClick={() => setPopup({ type: "editItem", id: item.id })}
                              className="w-11 h-11 flex justify-center items-center glass-card text-white/40 hover:text-blue-400 hover:border-blue-400/30 transition-all rounded-xl"
                              title="تعديل المنتج"
                            >
                              <FiEdit size={18} />
                            </button>

                            <button
                              onClick={() => setPopup({ type: "deleteItem", id: item.id })}
                              className="w-11 h-11 flex justify-center items-center glass-card text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all rounded-xl"
                              title="حذف المنتج"
                            >
                              <FiTrash2 size={18} />
                            </button>

                            <button
                              onClick={async () => {
                                const newStar = !localItems[item.id].star;
                                await update(ref(db, `items/${item.id}`), { star: newStar });
                                setLocalItems(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], star: newStar }
                                }));
                              }}
                              className={`w-11 h-11 flex justify-center items-center rounded-xl transition-all border
                                ${item.star
                                  ? "bg-[#FDB143]/10 text-[#FDB143] border-[#FDB143]/20"
                                  : "glass-card text-white/10 border-white/5 hover:text-[#FDB143] hover:border-[#FDB143]/20"}`}
                              title="تحديد كمميز"
                            >
                              <FiStar size={18} fill={item.star ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {catItems.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-white/20 text-sm font-light italic">لا توجد أصناف تتبع هذا القسم حالياً</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        galleryImages={galleryImages}
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
