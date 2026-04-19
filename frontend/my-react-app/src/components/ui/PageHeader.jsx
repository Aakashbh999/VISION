/**
 * PageHeader — standard portal page header.
 *
 * Props:
 *  title      – main heading text (required)
 *  subtitle   – supporting paragraph text
 *  action     – ReactNode rendered on the right (e.g. a <Link> or <button>)
 *  className  – extra classes for the outer wrapper
 *  compact    – if true, uses a lighter bg/border card card style
 */
const PageHeader = ({
  title,
  subtitle,
  action,
  className = "",
  compact = false,
}) => {
  if (compact) {
    return (
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}>
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[var(--text-main)] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--text-muted)] mt-1 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border-main)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${className}`}
    >
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--text-muted)] text-lg font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
