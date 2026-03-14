import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category } from "./types";
import { HiChevronDown, HiOutlineArrowsUpDown } from "react-icons/hi2";

interface Props {
  categories: Record<string, Category>;
  setPopup: (popup: PopupState) => void;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
}

/* =======================
   العنصر القابل للسحب
======================= */
const SortableCategory: React.FC<{
  cat: Category & { id: string };
  editingId: string | null;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, name: string) => void;
  toggleAvailability: (id: string, current: boolean) => void;
  setPopup: (popup: PopupState) => void;
  index: number;
}> = ({
  cat,
  editingId,
  tempName,
  setTempName,
  saveEdit,
  startEditing,
  toggleAvailability,
  setPopup,
  index,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
      zIndex: isDragging ? 50 : 1,
    };

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`
        relative
        glass-card
        rounded-2xl
        border border-white/5
        flex
        overflow-hidden
        mb-2 
        ${isDragging ? "opacity-50 scale-[1.02] border-[#FDB143]/30" : ""}
      `}
      >
        {/* Drag Rail */}
        <div
          {...listeners}
          className="
          cursor-grab select-none
          bg-white/5
          w-12 sm:w-14
          flex items-center justify-center
          active:scale-95
          transition-colors
          hover:bg-white/10
          border border-white/5
        "
        >
          <HiOutlineArrowsUpDown className="w-5 h-5 text-white/20 group-hover:text-[#FDB143]" />
        </div>

        {/* المحتوى */}
        <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-4 py-2 text-sm bg-white/5 border border-[#FDB143]/30 rounded-xl text-white focus:outline-none"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(cat.id)}
                  className="w-10 h-10 flex items-center justify-center bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                >
                  <FiCheck />
                </button>
              </div>
            ) : (
              <span className="text-sm md:text-lg font-black text-white px-2">
                {cat.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEditing(cat.id, cat.name)}
                className="w-10 h-10 flex items-center rounded-xl justify-center glass-card text-white/40 hover:text-blue-400 hover:border-blue-400/30 transition-all"
                title="تعديل"
              >
                <FiEdit size={16} />
              </button>

              <button
                onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
                className="w-10 h-10 flex items-center rounded-xl justify-center glass-card text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all"
                title="حذف"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <button
              onClick={() => toggleAvailability(cat.id, cat.available ?? true)}
              className={`relative w-14 h-7 rounded-full transition-all duration-500
              ${cat.available ? "bg-[#FDB143]" : "bg-white/10"}`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-500
                ${cat.available ? "translate-x-7" : ""}`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

/* =======================
   CategorySection
======================= */
const CategorySection: React.FC<Props> = ({
  categories,
  setPopup,
  newCategoryName,
  setNewCategoryName,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const saveEdit = async (id: string) => {
    if (!tempName.trim()) return;
    await update(ref(db, `categories/${id}`), { name: tempName.trim() });
    setEditingId(null);
    setTempName("");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await update(ref(db, `categories/${id}`), {
      available: !current,
    });
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB143]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">إدارة الأقسام</h2>
          <p className="text-white/40 text-sm font-light">قم بترتيب وتعديل تصنيفات المنيو</p>
        </div>

        <div className="flex gap-3">
          <input
            className="flex-1 md:w-64 px-5 py-4 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDB143]/50 transition-all font-light"
            placeholder="أضف قسماً جديداً..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            onClick={() => setPopup({ type: "addCategory" })}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FDB143] text-black shadow-lg shadow-[#FDB143]/20 hover:scale-[1.05] active:scale-95 transition-all"
          >
            <FiPlus size={24} />
          </button>
        </div>
      </div>

      <button
        onClick={() => setOpenCategories((p) => !p)}
        className="
          w-full mb-6
          flex items-center justify-between
          px-6 py-5
          glass-card
          border-white/5
          rounded-3xl
          hover:bg-white/5
          transition-all
          group/btn
        "
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40">
            <HiChevronDown
              className={`w-6 h-6 transition-transform duration-500 ${openCategories ? "rotate-180" : "rotate-0"}`}
            />
          </div>
          <span className="text-sm md:text-base font-bold text-white/80">عرض جميع الأقسام</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-[#FDB143]/10 text-[#FDB143] text-xs md:text-sm font-black px-4 py-1.5 rounded-full border border-[#FDB143]/20">
            {categoriesArray.length} قسم
          </span>
        </div>
      </button>

      {/* Accordion with Framer Motion */}
      <AnimatePresence>
        {openCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoriesArray.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col">
                    {categoriesArray.map((cat, index) => (
                      <SortableCategory
                        key={cat.id}
                        cat={cat}
                        editingId={editingId}
                        tempName={tempName}
                        setTempName={setTempName}
                        saveEdit={saveEdit}
                        startEditing={startEditing}
                        toggleAvailability={toggleAvailability}
                        setPopup={setPopup}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySection;
