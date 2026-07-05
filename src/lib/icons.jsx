// Inline SVG icons (stroke inherits currentColor unless filled).

const S = ({ children, size = 20, fill = "none", stroke = "currentColor", sw = 2, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

export const Bolt = ({ size = 20, fill = "none" }) => (
  <S size={size} fill={fill} stroke={fill === "none" ? "currentColor" : "none"}>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  </S>
);
export const List = (p) => <S {...p}><path d="M4 6h16M4 12h16M4 18h10" /></S>;
export const Calendar = (p) => <S {...p}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></S>;
export const Gear = (p) => <S {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2.4" /><circle cx="8" cy="17" r="2.4" /></S>;
export const Sun = (p) => <S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></S>;
export const Moon = (p) => <S {...p}><path d="M20 14.5A8 8 0 019.5 4 8.5 8.5 0 1020 14.5z" /></S>;
export const Bell = (p) => <S {...p}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 004 0" /></S>;
export const Clock = ({ size = 12 }) => <S size={size} sw={2.4}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>;
export const Globe = ({ size = 13 }) => <S size={size} sw={1.8}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></S>;
export const Chevron = ({ size = 15, color = "currentColor" }) => <S size={size} stroke={color}><path d="M9 6l6 6-6 6" /></S>;
export const ArrowOut = ({ size = 15 }) => <S size={size}><path d="M7 17L17 7M9 7h8v8" /></S>;
export const Check = ({ size = 14 }) => <S size={size} sw={2.6}><path d="M4 12l5 5L20 6" /></S>;
export const WifiOff = ({ size = 15 }) => <S size={size} sw={1.9}><path d="M2 8.5C6 5 11 4 15 5.5M4.5 12c2-1.6 4.5-2.3 7-2M8 15.5c1.4-1 3-1.3 4.5-.9M12 20h.01M2 2l20 20" /></S>;
export const Star = ({ size = 14, fill = "none" }) => <S size={size} fill={fill}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" /></S>;
export const X = ({ size = 14 }) => <S size={size} sw={2.4}><path d="M6 6l12 12M18 6L6 18" /></S>;
export const Plus = ({ size = 14 }) => <S size={size} sw={2.2}><path d="M12 5v14M5 12h14" /></S>;
