import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, push, remove, update, get, set } from "firebase/database";
import { FiDownload, FiSettings, FiUpload } from "react-icons/fi";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { FiLogOut } from "react-icons/fi";
import { useLocation } from "react-router-dom";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import CategorySection from "../components/admin/CategorySection";
import ItemSection from "../components/admin/ItemSection";
import Popup from "../components/admin/Popup";
import { type PopupState } from "../components/admin/types";
import OrderSettingsModal from "../components/admin/OrderSettingsModal";
import { FaDatabase } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AdminLogin from "../components/admin/AdminLogin";

export default function Admin() {
  const location = useLocation();
  const [authOk, setAuthOk] = useState(false);
  const [categories, setCategories] = useState<any>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [items, setItems] = useState<any>({});
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [editItemValues, setEditItemValues] = useState<{
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }>({
    itemName: "",
    itemPrice: "",
    priceTw: "",
    selectedCategory: "",
    itemIngredients: "",
  });
  const [editItemId, setEditItemId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSettings, setShowOrderSettings] = useState(false);
  const [orderSettings, setOrderSettings] = useState<any>(null);
  // const [showEditGallery, setShowEditGallery] = useState(false);
  const [settings, setSettings] = useState({
    orderSystem: false,
    orderSettings: { inRestaurant: false, takeaway: false, inPhone: "", outPhone: "" },
    complaintsWhatsapp: "",
    footerInfo: { address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" },
  });


  // ================= AUTH LISTENER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthOk(!!user);
    });
    return () => unsub();
  }, []);

  // ================= AUTO LOGOUT ON LEAVE /admin =================
  useEffect(() => {
    return () => {
      signOut(auth);
    };
  }, [location.pathname]);

  // ================= FIREBASE DATA =================
  useEffect(() => {
    if (!authOk) return;
    const catRef = ref(db, "categories");
    const itemRef = ref(db, "items");
    const unsubCats = onValue(catRef, (snap) => setCategories(snap.val() || {}));
    const unsubItems = onValue(itemRef, (snap) => setItems(snap.val() || {}));

    return () => {
      unsubCats();
      unsubItems();
    };
  }, [authOk]);

  // ================= ORDER SETTINGS INITIALIZE =================
  useEffect(() => {
    if (!authOk) return;

    const settingsRef = ref(db, "settings"); // ⚡ جلب كل الإعدادات
    const initSettings = async () => {
      const snap = await get(settingsRef);
      if (!snap.exists()) {
        // إذا مش موجود، نضيف إعدادات افتراضية كاملة
        const defaultSettings = {
          complaintsWhatsapp: "",
          footerInfo: {
            address: "",
            facebook: "",
            instagram: "",
            phone: "",
            tiktok: "",
            whatsapp: ""
          },
          orderSettings: {
            inRestaurant: false,
            inPhone: "",
            takeaway: false,
            outPhone: "",
          },
          orderSystem: true
        };
        await set(settingsRef, defaultSettings);
        setSettings(defaultSettings);
        setOrderSettings(defaultSettings); // ⚡ للModal
      } else {
        const data = snap.val();
        setSettings(data);
        setOrderSettings(data); // ⚡ للModal
      }
    };
    initSettings();
  }, [authOk]);


  // ================= LOGOUT =================

  const logout = async () => {
    await signOut(auth);
    setPopup({ type: null });
    setToast("تم تسجيل الخروج بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= CATEGORY =================
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast("⚠️  يجب إدخال اسم القسم أولاً");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const newName = newCategoryName.trim();
    const exists = Object.values(categories).some(
      (cat: any) => cat.name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (exists) {
      setToast(`القسم "${newName}" موجود مسبقاً`);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    await push(ref(db, "categories"), {
      name: newName,
      createdAt: Date.now(),
    });
    setNewCategoryName("");
    setPopup({ type: null });
    setToast(`تم إضافة القسم "${newName}" بنجاح ✅`);
    setTimeout(() => setToast(""), 4000);
  };

  const deleteCategory = async (id: string) => {
    await remove(ref(db, `categories/${id}`));
    Object.keys(items).forEach((itemId) => {
      if (items[itemId].categoryId === id) remove(ref(db, `items/${itemId}`));
    });
    setPopup({ type: null });
    setToast("  تم حذف القسم بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= ITEMS =================
  const deleteItem = async () => {
    if (!popup.id) return;
    await remove(ref(db, `items/${popup.id}`));
    setPopup({ type: null });
    setToast("  تم حذف الصنف بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  const updateItem = async () => {
    if (!editItemId) return;
    await update(ref(db, `items/${editItemId}`), {
      name: editItemValues.itemName,
      price: editItemValues.itemPrice,
      priceTw: editItemValues.priceTw || "",
      categoryId: editItemValues.selectedCategory,
      ingredients: editItemValues.itemIngredients || "",
    });
    setPopup({ type: null });
    setEditItemId("");
    setEditItemValues({
      itemName: "",
      itemPrice: "",
      priceTw: "",
      selectedCategory: "",
      itemIngredients: "",
    });
    setToast("  تم التعديل بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };
  // ================= EXPORT EXCEL =================
  const exportToExcel = async () => {
    if (!categories || !items) {
      alert("البيانات لم يتم تحميلها بعد!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Items");

    sheet.columns = [
      { header: "الاسم", key: "name", width: 30 },
      { header: "السعر", key: "price", width: 15 },
      { header: "سعر TW", key: "priceTw", width: 15 },
      { header: "القسم", key: "categoryName", width: 30 },
      { header: "المكونات", key: "ingredients", width: 40 },
      { header: "متوفر", key: "visible", width: 10 },
      { header: "مميزة", key: "star", width: 10 },
      { header: "صورة", key: "image", width: 25 },
    ];

    Object.values(items).forEach((item: any) => {
      const categoryName = categories[item.categoryId]?.name ?? "غير محدد";
      sheet.addRow({
        name: item.name,
        price: item.price,
        priceTw: item.priceTw || "",
        categoryName,
        ingredients: item.ingredients || "",
        visible: item.visible ? "نعم" : "لا",
        star: item.star ? "⭐" : "",
        image: item.image || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "hamada-menu.xlsx");

    setToast("تم تصدير البيانات بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= IMPORT EXCEL =================
  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        setToast("ملف غير صالح ❌");
        setLoading(false);
        return;
      }

      const categoryMap: Record<string, string> = {};
      Object.entries(categories).forEach(([id, cat]: any) => {
        categoryMap[cat.name.trim().toLowerCase()] = id;
      });

      const rows: any[] = [];
      sheet.eachRow((row, index) => {
        if (index === 1) return; // تجاهل رأس الجدول
        rows.push({
          name: row.getCell(1).value?.toString().trim() || "",
          price: row.getCell(2).value?.toString().trim() || "",
          priceTw: row.getCell(3).value?.toString().trim() || "",
          categoryName: row.getCell(4).value?.toString().trim() || "",
          ingredients: row.getCell(5).value?.toString().trim() || "",
          visible: row.getCell(6).value?.toString().trim().toLowerCase() === "نعم",
          star: row.getCell(7).value?.toString().trim() === "⭐",
          image: row.getCell(8).value?.toString().trim() || "",
        });
      });

      let addedCount = 0;
      for (const item of rows) {
        if (!item.name || !item.categoryName) continue;
        const categoryId = categoryMap[item.categoryName.toLowerCase()];
        if (!categoryId) continue;

        const exists = Object.values(items).some(
          (i: any) =>
            i.name.trim().toLowerCase() === item.name.toLowerCase() &&
            i.categoryId === categoryId
        );
        if (exists) continue;

        await push(ref(db, "items"), {
          name: item.name,
          price: item.price,
          priceTw: item.priceTw || "",
          categoryId,
          ingredients: item.ingredients || "",
          visible: item.visible ?? true,
          star: item.star ?? false,
          featured: item.featured || "",
          createdAt: Date.now(),
        });
        addedCount++;
      }

      if (addedCount > 0) setToast(`تم إضافة ${addedCount} صنف جديد ✅`);
      else setToast("القائمة محدثة بالفعل ✅");
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الاستيراد ❌");
    } finally {
      setLoading(false);
      e.target.value = "";
      setTimeout(() => setToast(""), 4000);
    }
  };


  // ================= EXPORT JSON =================
  const exportToJSON = () => {
    // بناء بيانات JSON بشكل مرتب
    const data = {
      categories,
      items,
      settings: {
        orderSystem: settings.orderSystem,
        orderSettings: {
          inRestaurant: settings.orderSettings.inRestaurant,
          takeaway: settings.orderSettings.takeaway,
          inPhone: settings.orderSettings.inPhone,
          outPhone: settings.orderSettings.outPhone,
        },
        complaintsWhatsapp: settings.complaintsWhatsapp,
        footerInfo: {
          address: settings.footerInfo.address || "",
          phone: settings.footerInfo.phone || "",
          whatsapp: settings.footerInfo.whatsapp || "",
          facebook: settings.footerInfo.facebook || "",
          instagram: settings.footerInfo.instagram || "",
          tiktok: settings.footerInfo.tiktok || "",
        },
      },
      meta: { version: "1.0", exportedAt: Date.now() },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);

    setToast("📦 تم تصدير جميع البيانات والإعدادات بنجاح");
    setTimeout(() => setToast(""), 4000);
  };





  // ================= SAVE ORDER SETTINGS =================
  const handleSaveOrderSettings = async (newSettings: any) => {
    try {
      setLoading(true);

      // تحديث Firebase
      await update(ref(db, "settings"), newSettings);

      // تحديث الـ state محلياً
      setSettings(newSettings);
      setOrderSettings(newSettings);

      setToast("تم حفظ إعدادات الطلب بنجاح ✅");
      setShowOrderSettings(false);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الحفظ ❌");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };



  // ================= LOGIN UI =================
  if (!authOk) {
    return <AdminLogin onAuthSuccess={() => setAuthOk(true)} />;
  }

  // ================= ADMIN PANEL =================
  return (
    <div className="min-h-screen w-full bg-[#040309] font-[Cairo] relative overflow-x-hidden pb-10" dir="rtl">
      {/* Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FDB143]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#940D11]/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-8 left-8 z-50 glass-card border-none bg-[#FDB143] text-white px-8 py-3 rounded-2xl font-black shadow-2xl transition-all"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#040309]/80 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#FDB143]/20 border-t-[#FDB143] rounded-full animate-spin" />
              <p className="text-white/60 text-sm font-bold tracking-widest">جاري معالجة البيانات...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs مخفية للملفات */}
      <input type="file" accept=".xlsx" id="excelUpload" hidden onChange={importFromExcel} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 mb-10 border border-white/10 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-white/5">
              <img src="/hamada.png" alt="Chef Hamada" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">لوحة الإدارة</h1>
              <p className="text-white/40 text-sm">Chef Hamada Digital Menu</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowOrderSettings(true)}
              className="p-3.5 rounded-2xl glass-card text-[#FDB143] border-[#FDB143]/30 hover:border-[#FDB143]/30 hover:text-[#FDB143] hover:bg-[#FDB143]/30 hover:scale-105 transition-all group relative"
              title="إعدادات الطلب"
            >
              <FiSettings size={22} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white hover:text-[#FDB143] hover:bg-[#FDB143]/30 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">إعدادات الطلب</span>
            </button>

            <button
              onClick={exportToExcel}
              className="p-3.5 rounded-2xl glass-card text-green-400 hover:border-green-400/30 hover:bg-[#FDB143]/30 hover:scale-105 transition-all group relative"
              title="تصدير Excel"
            >
              <FiUpload size={22} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white hover:text-[#FDB143] hover:bg-[#FDB143]/30 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">تصدير Excel</span>
            </button>

            <button
              onClick={() => document.getElementById("excelUpload")?.click()}
              className="p-3.5 rounded-2xl glass-card text-blue-400 hover:border-blue-400/30 hover:bg-[#FDB143]/30 hover:scale-105 transition-all group relative"
              title="استيراد Excel"
            >
              <FiDownload size={22} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white hover:text-[#FDB143] hover:bg-[#FDB143]/30 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">استيراد Excel</span>
            </button>

            <button
              onClick={exportToJSON}
              title="نسخة احتياطية"
              className="p-3.5 rounded-2xl glass-card text-[#FDB143] hover:border-[#FDB143]/30 hover:bg-[#FDB143]/30 hover:scale-105 transition-all group relative"
            >
              <FaDatabase size={22} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white hover:text-[#FDB143] hover:bg-[#FDB143]/30 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">نسخة احتياطية</span>
            </button>

            <button
              onClick={() => setPopup({ type: "logout" })}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#d60208]/10 text-[#d60208] border border-[#d60208]/20 hover:border-[#d60208]/30 hover:bg-[#d60208]/30 hover:scale-105 transition-all font-bold"
            >
              <FiLogOut size={18} />
              <span>خروج</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CategorySection
                categories={categories}
                setPopup={setPopup}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ItemSection
                categories={categories}
                items={items}
                popup={popup}
                setPopup={(p) => {
                  setPopup(p);
                  if (p.type === "editItem" && p.id) {
                    const item = items[p.id];
                    if (item) {
                      setEditItemId(p.id);
                      setEditItemValues({
                        itemName: item.name,
                        itemPrice: item.price,
                        priceTw: item.priceTw || "",
                        selectedCategory: item.categoryId,
                        itemIngredients: item.ingredients || "",
                      });
                    }
                  }
                }}
              />
            </motion.div>
          </div>
        </div>

        <Popup
          popup={popup}
          setPopup={setPopup}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          deleteItem={deleteItem}
          updateItem={updateItem}
          editItemValues={editItemValues}
          setEditItemValues={setEditItemValues}
          categories={categories}
          logout={logout}
        />
      </div>

      {/* Order Settings Modal */}
      <AnimatePresence>
        {showOrderSettings && orderSettings && (
          <OrderSettingsModal
            setShowOrderSettings={setShowOrderSettings}
            orderSettings={orderSettings}
            onSave={handleSaveOrderSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
