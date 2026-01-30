import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean; // <-- لازم يجي من Menu
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="mb-24 px-4 md:px-0">
      <div className="mb-14 flex items-center justify-center gap-4 w-full">
        <span className="flex-1 h-px bg-linear-to-r from-transparent via-[#FDB143]/70 to-transparent"></span>

        <h2 className="
      font-[Almarai] font-extrabold
      text-[#FDB143]
      drop-shadow-[0_4px_20px_rgba(253,177,67,0.45)]
      tracking-wide
      text-center text-3xl md:text-4xl
    ">
          {category.name}
        </h2>

        <span className="flex-1 h-px bg-linear-to-r from-transparent via-[#FDB143]/70 to-transparent"></span>
      </div>

      <div className="flex flex-col gap-3">
        {items.map(item => (
          <ItemRow key={item.id} item={item} orderSystem={orderSystem} />
        ))}
      </div>
    </section>

  );
}
