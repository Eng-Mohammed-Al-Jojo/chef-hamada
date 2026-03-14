import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";
import { motion } from "framer-motion";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-20 px-4 md:px-0"
    >
      <div className="mb-10 flex items-center justify-center gap-6 w-full group">
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-[#FDB143]/40 to-transparent transition-all duration-700 group-hover:via-[#FDB143]" />

        <h2 className="font-extrabold text-[#FDB143] tracking-widest text-center text-2xl md:text-3xl uppercase">
          {category.name}
        </h2>

        <div className="flex-1 h-px bg-linear-to-r from-transparent via-[#FDB143]/40 to-transparent transition-all duration-700 group-hover:via-[#FDB143]" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            orderSystem={orderSystem}
          />
        ))}
      </div>
    </motion.section>
  );
}
