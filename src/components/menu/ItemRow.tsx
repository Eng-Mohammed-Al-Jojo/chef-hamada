import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck } from "react-icons/fa";

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

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setShowToast(true);
    console.log("featured:", item.featured);

    setTimeout(() => {
      setAddedPrice(null);
      setShowToast(false);
    }, 1000);
  };

  return (
    <div
      className={`
        relative w-full rounded-3xl
        ${unavailable ? "opacity-65 cursor-not-allowed" : "hover:scale-[1.02]"}
        transition-transform duration-200
      `}
    >
      {/* ===== Card ===== */}
      <div
        className={`
    relative flex gap-4 justify-between items-stretch
    bg-linear-to-br from-[#0b0a0e]/90 to-[#040309]/95
    border ${unavailable ? "border-gray-500/40" : "border-[#FDB143]/50"}
    shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(253,177,67,0.05)]
    rounded-2xl p-4 sm:p-5
    font-[Almarai] font-bold
  `}
      >
        {/* Glow */}
        {!unavailable && (
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-[#FDB143]/10 via-[#FFD369]/20 to-[#FDB143]/10 blur-xl opacity-40 animate-pulse pointer-events-none" />
        )}

        {/* ===== الصورة + النص ===== */}
        <div className="flex gap-4 flex-1 min-w-0 z-10 items-center">
          {/* صورة الصنف (اختيارية) */}
          {item.featured && (
            <div
              className="
          w-16 h-16 sm:w-20 sm:h-20
          rounded-xl overflow-hidden shrink-0
          border border-[#FDB143]/40
          bg-black/40
          flex items-center justify-center
        "
            >
              <img
                src={`/featured/${item.featured}`} // الصورة
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"; // لو الصورة ضايعة
                }}
              />
            </div>
          )}

          {/* الاسم + المكونات */}
          <div className="flex flex-col justify-center min-w-0">
            <h3
              className={`
          text-md sm:text-lg md:text-xl font-extrabold leading-snug
          ${unavailable
                  ? "line-through decoration-gray-400/70 text-gray-300"
                  : "text-[#FFD369] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"}
        `}
            >
              {item.name}
            </h3>

            {hasIngredients && (
              <p
                className={`
            mt-1 text-xs sm:text-sm text-gray-300/80
            ${unavailable ? "line-through" : ""}
          `}
              >
                {item.ingredients}
              </p>
            )}
          </div>
        </div>

        {/* ===== الأسعار + زر الإضافة ===== */}
        <div
          className={`
      flex shrink-0 gap-2
      ${orderSystem ? "flex-col justify-center" : "flex-row items-center"}
      ${item.featured ? "items-center" : ""}
    `}
        >
          {prices.map((p) => {
            const price = Number(p.trim());
            const isAdded = addedPrice === price;

            return (
              <div
                key={price}
                className={`
            flex items-center
            ${orderSystem
                    ? "justify-center px-3 py-2 w-full"
                    : "justify-center px-2 py-2 min-w-[60px] sm:min-w-[80px]"}
            rounded-xl bg-black/40
            border border-[#FDB143]/30 pr-2
            backdrop-blur-sm transition-all duration-200
            ${unavailable ? "opacity-50 line-through" : ""}
          `}
              >
                {/* السعر */}
                <span
                  className={`
              text-sm sm:text-base font-extrabold whitespace-nowrap pl-2
              ${unavailable ? "text-gray-300" : "text-[#FFD369]"}
            `}
                >
                  {price}₪
                </span>

                {/* زر الإضافة */}
                {orderSystem && !unavailable && (
                  <button
                    onClick={() => handleAdd(price)}
                    className={`
                w-6 h-6 sm:w-7 sm:h-7
                flex items-center justify-center
                rounded-md font-bold text-black
                transition-all duration-500
                ${isAdded
                        ? "bg-[#FFD369]"
                        : "bg-linear-to-r from-[#FFD369]/90 to-[#FDB143]/90 hover:scale-105"}
              `}
                  >
                    {isAdded ? (
                      <FaCheck className="animate-pulse text-md" />
                    ) : (
                      <span className="text-lg md:text-xl">+</span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* ===== Toast ===== */}
      {showToast && (
        <div
          className="
            absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-full
            bg-linear-to-r from-[#FFD369] to-[#FDB143]
            text-black font-bold px-4 py-2 rounded-2xl
            shadow-lg shadow-black/50
            flex items-center gap-2
            animate-toast-show
            pointer-events-none z-50
          "
        >
          <FaCheck className="w-4 h-4" />
          <span className="text-sm sm:text-base">
            تمت إضافة الصنف ، تفقد الطلب
          </span>
        </div>
      )}
    </div>
  );
}
