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
  const cartItem = items.find(i => i.id === item.id);

  return (
    <div
      className={`rounded-3xl p-0 transition
    ${unavailable ? "opacity-60" : "hover:scale-[1.02]"}
  `}
    >      <div
      className={`relative rounded-2xl px-4 py-3
          bg-[#040309]/90
          border border-[#FDB143]/40
          shadow-[inset_0_0_25px_rgba(253,177,67,0.15)]
          font-[Almarai] font-bold
          ${unavailable
          ? "bg-[#040309]/80 border border-[#F5F8F7]/30"
          : "bg-[#040309]/90 border border-[#FDB143]/40"}`}
    >
        {/* Glow */}
        {!unavailable && (
          <div className="absolute inset-0 rounded-2xl bg-[#FDB143]/10 animate-pulse pointer-events-none" />
        )}

        {/* ===== 3 Columns Layout ===== */}
        <div className="relative z-10 grid grid-cols-[1fr_auto_auto] items-center gap-4">

          {/* ===== Right: Name + Ingredients ===== */}
          <div className="min-w-0" >
            <h3
              className={`text-md md:text-lg font-extrabold leading-snug  ${unavailable
                ? "line-through decoration-[#F5F8F7]/70 decoration-2 text-[#F5F8F7]/80"
                : ""
                }`}
            >
              {item.name}
            </h3>

            {item.ingredients && (
              <p
                className={`mt-1 text-xs md:text-sm text-[#F5F8F7]/80 ${unavailable
                  ? "line-through decoration-[#F5F8F7]/70 decoration-2 text-[#F5F8F7]/80"
                  : ""
                  }`}
              >
                {item.ingredients}
              </p>
            )}
          </div>

          {/* ===== Middle: Price ===== */}
          <div className="flex flex-wrap justify-end items-center text-md md:text-lg font-extrabold text-[#FDB143] whitespace-nowrap gap-1">
            {prices.map((p, i) => (
              <span
                key={i}
                className={item.visible === false ? "line-through text-[#FDB143]/60" : ""}
              >
                {p.trim()}₪{i < prices.length - 1 && " |"}
              </span>
            ))}
          </div>
          {/* ===== Left: Add / Counter ===== */}
          {orderSystem && !unavailable && (
            <div className="flex flex-col items-center justify-center gap-1">
              {!cartItem ? (
                <button
                  onClick={() => addItem(item)}
                  className="
                    w-8 h-8 rounded-full
                    bg-[#FDB143] text-[#040309]
                    font-extrabold text-xl
                    hover:shadow-[0_0_20px_rgba(253,177,67,0.7)]
                    transition
                  "
                >
                  +
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => increase(item.id)}
                    className="w-7 h-7 rounded-full bg-[#FDB143] text-[#040309] font-bold"
                  >
                    +
                  </button>

                  <span className="text-sm font-extrabold text-[#FDB143]">
                    {cartItem.qty}
                  </span>

                  <button
                    onClick={() => decrease(item.id)}
                    className="w-7 h-7 rounded-full bg-[#FDB143] text-[#040309] font-bold"
                  >
                    −
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
