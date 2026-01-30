import { type Item } from "./Menu";
import { useCart } from "../../context/CartContext";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item, orderSystem }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const { items, addItem, increase, decrease } = useCart();

  return (
    <div
      className={`
        relative rounded-2xl transition-transform duration-300
        ${unavailable ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.025]"}
      `}
    >
      {/* الخلفية مع عمق وفخامة */}
      <div
        className={`
          relative rounded-2xl p-4 sm:p-5
          bg-linear-to-br from-[#0b0a0e]/90 to-[#040309]/95
          border ${unavailable ? "border-gray-600/30" : "border-[#FDB143]/50"}
          shadow-[0_5px_25px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(253,177,67,0.08)]
          font-[Almarai] font-bold overflow-hidden
        `}
      >
        {/* Glow خارجي ديناميكي */}
        {!unavailable && (
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-[#FDB143]/20 via-[#FFD369]/30 to-[#FDB143]/20 blur-xl opacity-40 animate-pulse pointer-events-none" />
        )}

        {/* ===== Grid: الاسم + الأسعار ===== */}
        <div className="relative z-10 grid grid-cols-[1fr_auto] gap-4 sm:gap-5 items-start">
          {/* ===== الاسم والمكونات ===== */}
          <div className="min-w-0">
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
            {item.ingredients && (
              <p
                className={`
                  mt-1 text-xs sm:text-sm md:text-sm text-gray-300/80
                  ${unavailable ? "line-through" : ""}
                `}
              >
                {item.ingredients}
              </p>
            )}
          </div>

          {/* ===== الأسعار والتحكم ===== */}
          {orderSystem && (
            <div className="flex flex-col gap-1 sm:gap-2 justify-end ">
              {prices.map((p) => {
                const price = Number(p.trim());
                const key = `${item.id}-${price}`;
                const cartItem = items.find(i => i.priceKey === key);

                return (
                  <div
                    key={key}
                    className={`
                      flex items-center justify-between gap-2 px-2 sm:px-2 py-1 sm:py-1.5
                      rounded-xl bg-black/40 border border-[#FDB143]/30 backdrop-blur-sm
                      ${unavailable ? "line-through opacity-50" : "hover:bg-[#FDB143]/15"}
                      transition-colors duration-200
                    `}
                  >
                    {/* السعر */}
                    <span className="text-sm sm:text-base md:text-base font-extrabold text-[#FFD369] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                      {price}₪
                    </span>

                    {/* أزرار التحكم - تصميم جديد */}
                    {!unavailable && (
                      <div className="flex items-center justify-end gap-1 sm:gap-0.5 w-[70px] sm:w-[85px]">
                        {!cartItem ? (
                          <button
                            onClick={() => addItem(item, price)}
                            className="
                              w-8 h-6 sm:w-9 sm:h-7
                              bg-linear-to-r from-[#FFD369]/90 to-[#FDB143]/90
                              rounded-lg text-black font-bold
                              hover:scale-105 hover:shadow-md
                              transition-all
                            "
                          >
                            +
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => decrease(key)}
                              className="
                                w-7 h-6 sm:w-8 sm:h-7
                                bg-linear-to-r from-[#FDB143]/80 to-[#FFD369]/80
                                rounded-lg text-black font-bold
                                hover:scale-105 hover:shadow-md
                                transition-all
                              "
                            >
                              −
                            </button>
                            <span className="w-5 sm:w-6 text-center font-extrabold text-[#FFD369] text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                              {cartItem.qty}
                            </span>
                            <button
                              onClick={() => increase(key)}
                              className="
                                w-7 h-6 sm:w-8 sm:h-7
                                bg-linear-to-r from-[#FFD369]/80 to-[#FDB143]/80
                                rounded-lg text-black font-bold
                                hover:scale-105 hover:shadow-md
                                transition-all
                              "
                            >
                              +
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
