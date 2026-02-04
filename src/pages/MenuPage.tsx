import { useState } from "react";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";
import { FaFire } from "react-icons/fa";
import FeaturedModal from "../components/menu/FeaturedModal";

export default function MenuPage() {
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFeatured, setHasFeatured] = useState(false);

  return (
    <div
      dir="rtl"
      className="
        min-h-screen flex flex-col
        bg-[url('/bg4.jpg')] 
        bg-scroll md:bg-fixed md:bg-no-repeat md:bg-cover
        text-[#F5F8F7]
        font-[Cairo]
        relative
      "
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#040309] opacity-50 md:backdrop-blur-sm pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="flex justify-center py-10 relative">
          <img
            src="/hamada.png"
            alt="Logo"
            className="w-56 md:w-60 object-contain drop-shadow-[0_10px_40px_rgba(253,177,67,0.4)] animate-pulseScale"
          />
        </div>

        {/* Menu */}
        <div className="flex-1 w-full px-4 md:px-10">
          <Menu
            onLoadingChange={setLoading}
            onFeaturedCheck={setHasFeatured}
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Featured Button يظهر فقط بعد انتهاء التحميل و إذا يوجد صنف مميز */}
      {!loading && hasFeatured && (
        <div className="fixed top-4 left-4 z-50 flex flex-col items-center">
          <button
            onClick={() => setShowFeaturedModal(true)}
            className="
              flex flex-col items-center justify-center
              w-16 h-16
              bg-linear-to-br from-[#FDB143] via-[#FDB143] to-[#FDB143]
              text-[#040309] font-bold
              rounded-2xl
              shadow-lg
              hover:scale-110 hover:shadow-xl
              transition-all duration-300
              backdrop-blur-sm
            "
            title="الأكثر طلباً"
          >
            <FaFire className="w-6 h-6 animate-pulse text-[#9b2d0b]" />
            <span className="text-[10px] mt-1">الأكثر طلباً</span>
          </button>
        </div>
      )}

      {/* Cart Button يظهر فقط بعد انتهاء التحميل */}
      {!loading && (
        <div className="fixed bottom-6 right-4 z-50">
          <CartButton />
        </div>
      )}

      {/* Featured Modal */}
      <FeaturedModal
        show={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
      />
    </div>
  );
}
