import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PopupState } from "./types";
import { FiAlertTriangle, FiTrash2, FiSave, FiX, FiLogOut, FiPlusCircle, FiEdit3 } from "react-icons/fi";
import CustomSelect from "./CustomSelect";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  updateItem?: () => void;

  editItemValues?: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  };
  setEditItemValues?: (values: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }) => void;
  categories?: any;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  editItemValues,
  setEditItemValues,
  categories,
  logout,
}) => {
  if (!popup.type) return null;

  const close = () => {
    setPopup({ type: null });
  };

  return (
    <AnimatePresence>
      {popup.type && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md"
          />

          {/* Popup Container */}
          <div className="fixed inset-0 z-101 flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass-panel p-8 w-full max-w-md border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#FDB143]/50 to-transparent" />

              {/* Close Button */}
              <button
                onClick={close}
                className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-[#940D11]/20 hover:text-[#940D11] transition-all"
              >
                <FiX size={20} />
              </button>

              {/* ===== Logout ===== */}
              {popup.type === "logout" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-[#940D11]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLogOut className="text-[#940D11]" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">تسجيل الخروج</h3>
                  <p className="text-white/40 mb-8 font-light">هل أنت متأكد أنك تريد مغادرة لوحة التحكم؟</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        logout && logout();
                        close();
                      }}
                      className="flex-1 py-4 rounded-2xl bg-[#940D11] text-white font-black hover:bg-[#940D11]/80 transition-all shadow-lg"
                    >
                      تسجيل خروج
                    </button>
                    <button
                      onClick={close}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                    >
                      بقاء
                    </button>
                  </div>
                </div>
              )}

              {/* ===== Add Category Confirm (Used as simple confirm for consistency) ===== */}
              {popup.type === "addCategory" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-[#FDB143]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#FDB143]">
                    <FiPlusCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">تأكيد الإضافة</h3>
                  <p className="text-white/40 mb-8 font-light">سيتم إضافة القسم الجديد إلى القائمة فور التصديق</p>
                  <div className="flex gap-4">
                    <button
                      onClick={addCategory}
                      className="flex-1 py-4 rounded-2xl bg-[#FDB143] text-black font-black hover:scale-[1.02] transition-all shadow-lg shadow-[#FDB143]/20"
                    >
                      إضافة الآن
                    </button>
                    <button
                      onClick={close}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* ===== Delete Category ===== */}
              {popup.type === "deleteCategory" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <FiAlertTriangle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">حذف القسم؟</h3>
                  <p className="text-white/40 mb-8 font-light text-sm leading-relaxed">
                    تحذير: سيتم حذف القسم <span className="text-white font-bold">بجميع أصنافه</span> المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => deleteCategory && deleteCategory(popup.id!)}
                      className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition-all shadow-lg"
                    >
                      حذف نهائي
                    </button>
                    <button
                      onClick={close}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* ===== Delete Item ===== */}
              {popup.type === "deleteItem" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <FiTrash2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">حذف المنتج</h3>
                  <p className="text-white/40 mb-8 font-light">هل أنت متأكد من حذف هذا المنتج من القائمة؟</p>
                  <div className="flex gap-4">
                    <button
                      onClick={deleteItem}
                      className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition-all shadow-lg"
                    >
                      نعم، احذف
                    </button>
                    <button
                      onClick={close}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              )}

              {/* ===== Edit Item ===== */}
              {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
                <div className="py-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDB143]/10 flex items-center justify-center text-[#FDB143]">
                      <FiEdit3 size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">تعديل المنتج</h3>
                      <p className="text-white/30 text-sm font-light">تحديث بيانات وصور المنتج</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* القسم */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mr-2">القسم</label>
                      {(() => {
                        const [selectedCategory, setSelectedCategory] = useState(editItemValues.selectedCategory || "");
                        const [selectedCategoryError, setSelectedCategoryError] = useState(false);

                        return (
                          <CustomSelect
                            options={Object.keys(categories).map(id => ({ id, name: categories[id].name }))}
                            value={selectedCategory}
                            onChange={(val) => {
                              setSelectedCategory(val);
                              setSelectedCategoryError(false);
                              setEditItemValues({ ...editItemValues, selectedCategory: val });
                            }}
                            error={selectedCategoryError}
                            placeholder="اختر الفئة"
                          />
                        );
                      })()}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/20 font-bold uppercase mr-2 tracking-widest">اسم المنتج</label>
                      <input
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                        placeholder="اسم المنتج"
                        value={editItemValues.itemName}
                        onChange={(e) =>
                          setEditItemValues({ ...editItemValues, itemName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/20 font-bold uppercase mr-2 tracking-widest">الوصف / المكونات</label>
                      <textarea
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light resize-none h-24"
                        placeholder="المكونات (اختياري)"
                        value={editItemValues.itemIngredients}
                        onChange={(e) =>
                          setEditItemValues({ ...editItemValues, itemIngredients: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/20 font-bold uppercase mr-2 tracking-widest">الأسعار</label>
                        <input
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                          placeholder="مثال: 10, 15"
                          value={editItemValues.itemPrice}
                          onChange={(e) =>
                            setEditItemValues({ ...editItemValues, itemPrice: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/20 font-bold uppercase mr-2 tracking-widest">سعر T.W</label>
                        <input
                          type="number"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
                          placeholder="اختياري"
                          value={editItemValues.priceTw}
                          onChange={(e) =>
                            setEditItemValues({ ...editItemValues, priceTw: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={updateItem}
                      className="flex-1 py-4 rounded-2xl bg-[#FDB143] text-black font-black hover:scale-[1.02] shadow-lg shadow-[#FDB143]/10 transition-all flex items-center justify-center gap-2"
                    >
                      <FiSave size={18} />
                      <span>حفظ التعديلات</span>
                    </button>
                    <button
                      onClick={close}
                      className="px-6 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white transition-all font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Popup;

