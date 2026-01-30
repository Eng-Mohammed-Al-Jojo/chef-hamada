import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import type { PopupState, Category, Item } from "./types";
import FeaturedGallery from "./FeaturedGallery";

/* ================== auto load feature images from public/featured ================== */
const featureImages = Object.keys(
  import.meta.glob("/public/featured/*")
).map((path) => path.replace("/public/featured/", ""));
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

  // ================== Gallery state ==================
  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemFeatured, setItemFeatured] = useState(""); // الصورة الحالية في المودال

  // ================== Local state for items ==================
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  // تحديث الـ state المحلي إذا تغيّر الـ prop
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ================== Firebase updates ==================
  const addItem = async () => {
    if (!selectedCategory || !itemName || !itemPrice) return;

    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
      featured: itemFeatured || "",
      star: false,
    });

    // Reset form
    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
    setItemFeatured("");
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateFeatured = async (id: string, featured: string) => {
    await update(ref(db, `items/${id}`), { featured });
  };

  const removeFeatured = async (id: string) => {
    await update(ref(db, `items/${id}`), { featured: "" });
  };

  // ================== Gallery handlers ==================
  const openGallery = (itemId: string, currentFeatured?: string) => {
    setGalleryForItemId(itemId);
    setItemFeatured(currentFeatured || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateFeatured(galleryForItemId, img);
    setShowGallery(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ================== JSX ==================
  return (
    <div className="bg-white p-5 rounded-2xl border-4" style={{ borderColor: "#FDB143" }}>
      <h2 className="font-bold mb-4 text-2xl text-gray-800">الأصناف حسب الأقسام</h2>

      {/* ================== إضافة صنف ================== */}
      <div className="flex flex-col gap-2 mb-5">
        <select
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB143]"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">اختر القسم</option>
          {Object.keys(categories).map((id) => (
            <option key={id} value={id}>{categories[id].name}</option>
          ))}
        </select>

        <input
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB143]"
          placeholder="اسم الصنف"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <input
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB143]"
          placeholder="المكونات أو الوصف (اختياري)"
          value={itemIngredients}
          onChange={(e) => setItemIngredients(e.target.value)}
        />

        <input
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB143]"
          placeholder="الأسعار (افصل بين الأسعار بفاصلة)"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />

        <button
          onClick={addItem}
          className="bg-[#FDB143] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#FDB143]/80 transition"
        >
          إضافة الصنف
        </button>
      </div>

      {/* ================== البحث ================== */}
      <input
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB143]"
        placeholder="ابحث بسرعة عن صنف أو قسم أو سعر..."
        value={quickSearch}
        onChange={(e) => setQuickSearch(e.target.value)}
      />

      {/* ================== الأقسام ================== */}
      <div className="space-y-3">
        {Object.keys(categories).map((catId) => {
          const cat = categories[catId];
          const catItems = Object.keys(localItems)
            .map((id) => ({ ...localItems[id], id }))
            .filter((item) => item.categoryId === catId)
            .filter((item) => {
              const search = quickSearch.toLowerCase();
              return (
                item.name.toLowerCase().includes(search) ||
                cat.name.toLowerCase().includes(search) ||
                item.price.split(",").some((p) => p.includes(search))
              );
            });

          return (
            <div key={catId} className="rounded-lg border border-gray-200 shadow-sm">
              <div
                className="flex justify-between items-center cursor-pointer px-4 py-2 font-semibold text-gray-800 bg-gray-50 rounded-t-lg hover:bg-gray-100 transition"
                onClick={() => toggleSection(catId)}
              >
                {cat.name}
                <span>{expandedSections[catId] ? "▲" : "▼"}</span>
              </div>

              {expandedSections[catId] && (
                <div className="divide-y divide-gray-100">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-2 bg-white gap-2"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        {item.featured ? (
                          <div className="relative">
                            <img
                              src={`/featured/${item.featured}`}
                              alt={item.name}
                              className="w-10 h-10 object-contain bg-black rounded cursor-pointer"
                              onClick={() => openGallery(item.id, item.featured)}
                            />
                            <button
                              onClick={() => removeFeatured(item.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 flex justify-center items-center bg-red-600 text-white rounded-full hover:bg-red-700 transition text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openGallery(item.id)}
                            className="w-10 h-10 flex justify-center items-center rounded bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition text-sm font-bold"
                          >
                            +
                          </button>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-700">{item.name}</p>
                          {item.ingredients && (
                            <p className="truncate text-sm text-gray-500">{item.ingredients}</p>
                          )}
                          <p className="truncate text-sm text-gray-400">{item.price} ₪</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => toggleItem(item.id, item.visible)}
                          className={`w-16 h-8 text-sm rounded-lg text-white ${item.visible ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}`}
                        >
                          {item.visible ? "متوفر" : "غير متوفر"}
                        </button>

                        <button
                          onClick={() => setPopup({ type: "editItem", id: item.id })}
                          className="w-8 h-8 flex justify-center items-center bg-yellow-400 rounded-lg hover:bg-yellow-500 transition"
                        >
                          <FiEdit size={16} />
                        </button>

                        <button
                          onClick={() => setPopup({ type: "deleteItem", id: item.id })}
                          className="w-8 h-8 flex justify-center items-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>

                        {/* ⭐ Toggle Star */}
                        <button
                          onClick={async () => {
                            const newStar = !localItems[item.id].star;
                            await update(ref(db, `items/${item.id}`), { star: newStar });
                            setLocalItems((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], star: newStar },
                            }));
                          }}
                          className={`w-8 h-8 flex justify-center items-center rounded-lg transition ${localItems[item.id].star ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
                        >
                          <FaStar size={24} />
                        </button>

                      </div>
                    </div>
                  ))}

                  {catItems.length === 0 && (
                    <p className="px-4 py-2 text-gray-400 text-sm">
                      لا توجد أصناف في هذا القسم
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================== Featured Gallery Modal ================== */}
      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        featureImages={featureImages}
        selectedImage={itemFeatured}
      />
    </div>
  );
};

export default ItemSection;
