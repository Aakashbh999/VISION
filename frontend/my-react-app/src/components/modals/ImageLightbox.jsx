import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Download, Maximize2 } from "lucide-react";

const ImageLightbox = ({ isOpen, image, title, onClose }) => {
  if (!isOpen || !image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col p-4 md:p-10"
        onClick={onClose}
      >
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-sm uppercase tracking-widest line-clamp-1 pr-10">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={image}
            alt={title}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Footer info */}
        <div className="mt-4 flex justify-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/50 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2">
            <Maximize2 className="w-3 h-3" /> Full Resolution View
          </div>
          <a 
            href={image} 
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
          >
            <Download className="w-3 h-3" /> Open Original
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
