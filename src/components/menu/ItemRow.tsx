import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item, orderSystem }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const { addItem } = useCart();
  const [addedPrice, setAddedPrice] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const hasIngredients = !!item.ingredients;
  const hasImage = !!item.image;

  const hasTakeawayPrice =
    item.priceTw !== undefined &&
    item.priceTw !== null &&
    String(item.priceTw).trim() !== "" &&
    Number(item.priceTw) > 0;

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setShowToast(true);

    setTimeout(() => {
      setAddedPrice(null);
      setShowToast(false);
    }, 1000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative w-full rounded-3xl`}
    >
      {/* Card الخلفية */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative flex justify-between items-center
          bg-linear-to-br from-[#0b0a0e]/90 to-[#040309]/95
          border ${unavailable ? "border-gray-500/40" : "border-[#FDB143]/50"}
          shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(253,177,67,0.05)]
          rounded-2xl p-4 sm:p-5 gap-4 font-[Almarai] font-bold min-h-[70px]`}
      >
        {/* Glow خفيف */}
        {!unavailable && (
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-[#FFD369]/10 via-[#FFD369]/20 to-[#FFD369]/10 blur-xl opacity-40 animate-pulse pointer-events-none" />
        )}

        {/* الصورة + الاسم + المكونات */}
        <div className="flex gap-4 flex-1 min-w-0 z-10 items-center">
          <div className="flex flex-col justify-center min-w-0 w-full h-full">
            <h3
              className={`text-sm sm:text-base md:text-lg font-extrabold leading-snug
                ${unavailable
                  ? "line-through decoration-gray-400/70 text-gray-300"
                  : "text-[#FFD369] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"}
              `}
            >
              {item.name}
            </h3>
            {hasIngredients && (
              <p
                className={`mt-1 text-[10px] sm:text-sm md:text-sm text-gray-300/80
                  ${unavailable ? "line-through" : ""}`}
              >
                {item.ingredients}
              </p>
            )}
          </div>
        </div>

        {/* Box الأسعار + زر إضافة */}
        <div className={`flex shrink-0 gap-2 flex-col justify-center ${hasImage ? "items-center" : ""}`}>
          {/* Takeaway Price Badge */}
          {hasTakeawayPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-center gap-2"
            >
              <div
                className={`relative flex items-center justify-center px-3 py-2 min-w-[60px] sm:min-w-[80px]
                  gap-2 rounded-xl bg-black/40 border border-[#FDB143]/30
                  transition-all duration-200 ${unavailable ? "opacity-50 line-through" : ""}
                `}
              >
                <span className="absolute -top-2 -right-2 bg-[#FFD369] text-black text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  T.W
                </span>
                <span
                  className={`text-sm sm:text-base font-extrabold whitespace-nowrap
                    ${unavailable ? "text-gray-300 line-through" : "text-[#FFD369]"}`}
                >
                  {item.priceTw}₪
                </span>
                {orderSystem && !unavailable && (
                  <button
                    onClick={() => handleAdd(Number(item.priceTw))}
                    className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md font-bold text-black
                      ${addedPrice === Number(item.priceTw)
                        ? "bg-[#FFD369]"
                        : "bg-linear-to-r from-[#FFD369]/90 to-[#FDB143]/90 hover:scale-105"}
                      transition-all duration-200`}
                  >
                    {addedPrice === Number(item.priceTw) ? (
                      <FaCheck className="animate-pulse text-md" />
                    ) : (
                      <span className="text-lg md:text-xl">+</span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* أسعار عادية */}
          {prices.map((p) => {
            const price = Number(p.trim());
            const isAdded = addedPrice === price;

            return (
              <motion.div
                key={price}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-center px-2 py-2 min-w-[60px] sm:min-w-[80px]
                  gap-2 rounded-xl bg-black/40 border border-[#FDB143]/30 backdrop-blur-sm
                  transition-all duration-200 ${unavailable ? "opacity-50 line-through" : ""}`}
              >
                <span
                  className={`text-sm sm:text-base font-extrabold whitespace-nowrap
                    ${unavailable ? "text-gray-300 line-through" : "text-[#FFD369]"}`}
                >
                  {price}₪
                </span>
                {orderSystem && !unavailable && (
                  <button
                    onClick={() => handleAdd(price)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md font-bold text-black
                      transition-all duration-300
                      ${isAdded ? "bg-[#FFD369] text-black" : "bg-linear-to-r from-[#FFD369]/90 to-[#FDB143]/90 hover:scale-105"}`}
                  >
                    {isAdded ? <FaCheck className="animate-pulse text-md" /> : <span className="text-lg md:text-xl">+</span>}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full
              bg-linear-to-r from-[#FFD369] to-[#FDB143]
              text-black font-bold px-4 py-2 rounded-2xl
              shadow-lg shadow-black/50
              flex items-center gap-2
              z-50 pointer-events-none"
          >
            <FaCheck className="text-black w-4 h-4" />
            <span className="text-sm sm:text-base">تمت إضافة الصنف ، تفقد الطلب</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}