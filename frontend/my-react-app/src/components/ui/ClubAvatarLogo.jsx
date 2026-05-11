
const SIZE_MAP = {
  sm: "w-12 h-12 text-base",
  md: "w-14 h-14 text-xl",
  lg: "w-20 h-20 text-2xl",
};

const ClubAvatarLogo = ({
  club,
  size = "md",
  rounded = "rounded-[1.25rem]",
  className = "",
}) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`${sizeClass} ${rounded} bg-[var(--bg-active)] flex items-center justify-center text-purple-500 font-black shrink-0 border border-[var(--border-main)] shadow-sm overflow-hidden ${className}`}
    >
      {club.logo_url ? (
        <img
          src={club.logo_url}
          alt=""
          className={`w-full h-full object-cover ${rounded}`}
        />
      ) : (
        club.club_name?.charAt(0).toUpperCase()
      )}
    </div>
  );
};

export default ClubAvatarLogo;
