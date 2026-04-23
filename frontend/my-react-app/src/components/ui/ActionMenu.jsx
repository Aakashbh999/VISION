import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

const ActionMenu = ({
  actions = [],
  trigger = <MoreHorizontal className="w-5 h-5 pointer-events-none" />,
  className = "",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  const alignClasses = {
    right: "right-0 translate-y-2",
    left: "left-0 translate-y-2",
    center: "left-1/2 -translate-x-1/2 translate-y-2",
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-active)] transition-colors duration-200"
        aria-label="Actions"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 ${alignClasses[align] || alignClasses.right} min-w-[160px] bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-xl overflow-hidden`}
        >
          <div className="py-1">
            {actions.map((action, index) => {
              if (action.render) {
                return (
                  <div key={index} onClick={() => setIsOpen(false)}>
                    {action.render()}
                  </div>
                );
              }

              const isLink = !!action.href;
              const ActionComponent = isLink ? Link : "button";

              return (
                <ActionComponent
                  key={index}
                  to={action.href}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-150 ${
                    action.variant === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                  }`}
                >
                  {action.icon && (
                    <span className="w-4 h-4">{action.icon}</span>
                  )}
                  {action.label}
                </ActionComponent>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
