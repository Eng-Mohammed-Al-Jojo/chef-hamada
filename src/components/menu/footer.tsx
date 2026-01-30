import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
  FaCommentDots,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import FeedbackModal from "../menu/FeedbackModal";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    telegram: "",
  });

  useEffect(() => {
    // 1️⃣ جلب من localStorage أولاً
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) setFooter(JSON.parse(localData));

    // 2️⃣ الاستماع لتغييرات Firebase مباشرة
    const footerRef = ref(db, "settings/footerInfo");
    const unsubscribe = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooter(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    });

    // تنظيف listener عند إزالة المكون
    return () => unsubscribe();
  }, []);

  // ===== Social Icons Mapping =====
  const socialIcons: { Icon: any; url: string | undefined }[] = [
    { Icon: FaWhatsapp, url: footer.whatsapp ? `https://wa.me/${footer.whatsapp}` : undefined },
    { Icon: FaInstagram, url: footer.instagram },
    { Icon: FaFacebookF, url: footer.facebook },
    { Icon: FaTiktok, url: footer.tiktok },
    { Icon: FaTelegramPlane, url: footer.telegram },
  ];

  return (
    <footer className="mt-20
      bg-linear-to-t from-[#040309] via-[#040309]/95 to-[#040309]/90
      text-[#F5F8F7]
      rounded-t-3xl
      border-t border-[#FDB143]/30
      font-[Almarai]">

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* يمين – الموقع */}
        <div className="flex flex-col md:items-end items-center space-y-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-lg font-[Cairo]">
            <FaMapMarkerAlt className="text-xl shrink-0" />
            <span className="text-right">
              {footer.address || "غزة شارع الثورة مقابل تاج مول"}
            </span>
          </div>


          <div className="flex flex-col gap-1 items-start md:items-end">
            {footer.phone && (
              <a href={`tel:${footer.phone}`} className="flex items-center gap-2">
                <FaPhoneAlt /> {footer.phone}
              </a>
            )}

          </div>
        </div>

        {/* الوسط – أيقونات التواصل */}
        <div className="flex flex-col items-center gap-5 w-full md:w-auto">
          <div className="flex gap-4">
            {socialIcons.map(
              ({ Icon, url }, i) =>
                url && (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center
                      bg-[#FDB143] text-[#040309]
                      hover:scale-110
                      hover:shadow-[0_0_25px_rgba(253,177,67,0.6)]
                      transition-all duration-300"
                  >
                    <Icon className="text-white text-lg" />
                  </a>
                )
            )}
          </div>
          {/* Feedback Button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="
                mt-4 w-full max-w-xs flex items-center justify-center gap-2             
                bg-[#FDB143] text-[#040309]
                rounded-2xl
                py-3 px-4
                shadow-lg
                hover:scale-105 hover:shadow-xl
                transition-all duration-300
              "
          >
            <FaCommentDots className="w-6 h-6 animate-pulse" />
            <span className="text-sm font-semibold">أرسل تقييمك</span>
          </button>
        </div>

        {/* يسار – توقيع المهندس */}
        <div className="flex flex-col md:items-start items-center w-full md:w-auto">
          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <FaLaptopCode className="text-white text-lg" />
            </div>

            <div className="leading-tight text-center md:text-left">
              <span className="block text-[10px] opacity-70">
                تصميم وتطوير
              </span>
              <span className="block font-extrabold text-xs md:text-sm">
                Eng. Mohammed Eljoujo
              </span>
            </div>
          </a>
        </div>

      </div>

      <FeedbackModal show={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </footer>
  );
}
