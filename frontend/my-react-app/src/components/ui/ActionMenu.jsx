import { useState, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "../../hooks/useClickOutside";

const ActionMenu = ({ 
  actions = [], 
  trigger = <MoreHorizontal className="w-5 h-5" />, 
  className = "",
  align = "right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  const alignClasses = {
    right: "right-0 translate-y-2",
    left: "left-0 translate-y-2",
    center: "left-1/2 -translate-x-1/2 translate-y-2"
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Actions"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute z-30 ${alignClasses[align] || alignClasses.right} min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden`}
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-150 ${
                    action.variant === "danger" 
                      ? "text-red-600 hover:bg-red-50" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;
