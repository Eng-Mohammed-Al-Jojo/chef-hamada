import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiMove } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";

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
}> = ({
  cat,
  editingId,
  tempName,
  setTempName,
  saveEdit,
  startEditing,
  toggleAvailability,
  setPopup,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="bg-gray-100 px-3 py-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        {/* جهة اليسار: أيقونة السحب + الاسم */}
        <div className="flex items-center gap-2 flex-1">
          <div
            {...listeners}
            className="cursor-grab select-none p-1 rounded-md bg-gray-200"
          >
            <FiMove size={18} className="text-gray-600" />
          </div>

          {editingId === cat.id ? (
            <>
              <input
                className="flex-1 p-1 border rounded-xl"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <button
                onClick={() => saveEdit(cat.id)}
                className="text-green-600 hover:text-green-800 ml-2"
              >
                <FiCheck />
              </button>
            </>
          ) : (
            <span className="flex-1 font-medium">{cat.name}</span>
          )}
        </div>

        {/* جهة اليمين: تعديل، حذف، سويتش */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => startEditing(cat.id, cat.name)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
            className="text-red-600 hover:text-red-800 p-1 rounded-md"
          >
            <FiTrash2 />
          </button>

          <button
            onClick={() => toggleAvailability(cat.id, cat.available ?? true)}
            className={`relative w-10 h-5 rounded-full transition-all ${cat.available ? "bg-green-500" : "bg-gray-400"
              }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cat.available ? "translate-x-5 scale-105" : "translate-x-0.5"
                }`}
            />
          </button>
        </div>
      </div>
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

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const saveEdit = async (id: string) => {
    if (!tempName.trim()) return;
    await update(ref(db, `categories/${id}`), {
      name: tempName.trim(),
    });
    setEditingId(null);
    setTempName("");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await update(ref(db, `categories/${id}`), {
      available: !current,
    });
  };

  /* تحويل object إلى array وترتيب حسب order */
  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  /* الحساسات للكمبيوتر + الجوال */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  /* عند نهاية السحب */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    // تحديث order في Firebase دفعة واحدة
    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categoriesArray.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="bg-white p-4 rounded-3xl mb-6 border-4"
          style={{ borderColor: "#FDB143" }}
        >
          <h2 className="font-bold mb-3 text-2xl">الأقسام</h2>

          {/* إضافة قسم */}
          <div className="flex gap-2 flex-wrap mb-4">
            <input
              className="flex-1 p-2 border rounded-xl min-w-[160px]"
              placeholder="اسم القسم"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              onClick={() => setPopup({ type: "addCategory" })}
              className="px-4 rounded-xl bg-[#FDB143] text-white hover:bg-[#FDB143]/80"
            >
              <FiPlus className="text-xl" />
            </button>
          </div>

          {/* عرض الأقسام */}
          <div className="flex flex-col gap-2">
            {categoriesArray.map((cat) => (
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
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CategorySection;
