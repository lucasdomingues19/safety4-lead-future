import miaPhoto from "@/assets/mia.jpg";

/** Mia's face, used wherever she speaks: the tour, Ask Mia, Support. */
export function MiaAvatar({ size = 40, ring = true, className = "" }: { size?: number; ring?: boolean; className?: string }) {
  return (
    <img
      src={miaPhoto}
      alt="Mia, your SafetyTech Academy guide"
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size, boxShadow: ring ? "0 0 0 2px #fff, 0 0 0 4px #3434ff" : undefined }}
      draggable={false}
    />
  );
}

export { miaPhoto };
