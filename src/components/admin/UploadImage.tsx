import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface UploadImageProps {
    onUpload: (filename: string) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("الرجاء اختيار صورة أولاً");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const res = await axios.post("http://localhost:5000/upload-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onUpload(res.data.filename);
            setFile(null);
            setError(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setError("فشل رفع الصورة، حاول مرة أخرى");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-4xl border border-white/5 bg-white/2 flex flex-col gap-5 overflow-hidden transition-all hover:border-white/10" dir="rtl">
            <label className="relative group cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`
                    border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all
                    ${file ? "border-[#FDB143] bg-[#FDB143]/5" : "border-white/10 hover:border-[#FDB143]/30 hover:bg-white/5"}
                `}>
                    <FiUploadCloud size={40} className={`mb-4 transition-colors ${file ? "text-[#FDB143]" : "text-white/10"}`} />
                    <span className={`text-sm font-black text-center ${file ? "text-white" : "text-white/20"}`}>
                        {file ? file.name : "اضغط هنا لاختيار صورة من جهازك"}
                    </span>
                    {!file && <span className="text-[10px] text-white/10 mt-2 font-light tracking-wider uppercase">PNG, JPG up to 5MB</span>}
                </div>
            </label>

            <AnimatePresence mode="wait">
                {file && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-4 rounded-2xl bg-[#FDB143] text-black font-black text-lg shadow-xl shadow-[#FDB143]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <FiUploadCloud size={20} />
                                <span>رفع الصورة الآن</span>
                            </>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-red-400 text-xs font-bold px-2"
                    >
                        <FiAlertCircle size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-green-400 text-xs font-bold px-2"
                    >
                        <FiCheckCircle size={16} />
                        <span>تم رفع الصورة بنجاح!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadImage;
