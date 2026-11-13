import React, { useState } from 'react';

type VisualKind = 'burger' | 'fries' | 'drink' | 'meal' | 'bag' | 'card' | 'home' | 'category' | 'accessibility';

const resolveKind = (value = ''): VisualKind => {
  if (['burger', 'fries', 'drink', 'meal', 'bag', 'card', 'home', 'category', 'accessibility'].includes(value)) return value as VisualKind;
  return 'category';
};

export const VisualIcon: React.FC<{ kind?: string; className?: string; label?: string; photoKey?: string }> = ({
  kind,
  className,
  label,
  photoKey,
}) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const supportedKinds = ['burger', 'fries', 'drink', 'meal', 'bag', 'card', 'home', 'category'];
  const visualKind = (supportedKinds.includes(kind || '') ? kind : resolveKind(kind || label)) as VisualKind;
  const common = { className: `visual-icon-svg ${className || ''}`, viewBox: '0 0 120 90', role: 'img' as const, 'aria-label': label || visualKind };

  const stablePhotoKey = photoKey || kind || label || '';
  const photoMap: Record<string, string> = {
    'takeaway-bag': 'https://www.mcdonalds.com/content/dam/sites/ch/nfl/newsroom/McDonalds%20G%C3%BCtertransport%20mit%2056%20Prozent%20per%20Bahn.jpg',
    'classic-burger': '/product-photos/burger.png',
    'bacon-supreme': '/product-photos/burger.png',
    cheeseburger: '/product-photos/burger.png',
    'veggie-burger': '/product-photos/burger.png',
    'spicy-crispy': '/product-photos/chicken.png',
    'crispy-strips-3': '/product-photos/chicken.png',
    'crispy-strips-5': '/product-photos/chicken.png',
    'chicken-wings-6': '/product-photos/chicken.png',
    'fries-medium': '/product-photos/fries.png',
    'fries-large': '/product-photos/fries.png',
    cola: '/product-photos/drink.png',
    'cola-zero': '/product-photos/drink.png',
    sprite: '/product-photos/drink.png',
    fanta: '/product-photos/drink.png',
    'ice-tea': '/product-photos/drink.png',
    'sprite-sakura': '/product-photos/drink.png',
    'water-sparkling': '/product-photos/water.png',
    'water-still': '/product-photos/water.png',
    'latte-small': '/product-photos/latte.png',
    latte: '/product-photos/latte.png',
    cappuccino: '/product-photos/latte.png',
    'flat-white': '/product-photos/latte.png',
    'sundae-caramel': '/product-photos/sundae.png',
    'apple-pie': '/product-photos/apple-pie.png',
  };
  const photoUrl = photoMap[stablePhotoKey];

  if (photoUrl && !photoFailed) {
    return <img className={`product-photo ${className || ''}`} src={photoUrl} alt={label || 'Produkt'} loading="lazy" onError={() => setPhotoFailed(true)} />;
  }

  if (visualKind === 'burger') return <svg {...common}><ellipse cx="60" cy="74" rx="45" ry="8" fill="#e5e1db"/><path d="M18 47c0-17 18-31 42-31s42 14 42 31v5H18z" fill="#d99b42"/><path d="M18 48h84v9H18z" fill="#5a8c3f"/><path d="M18 57h84v8H18z" fill="#efbf38"/><path d="M18 65h84v8H18z" fill="#6b3424"/><path d="M20 73h80c-2 9-14 13-40 13S22 82 20 73" fill="#d99b42"/><g fill="#fff1c9"><circle cx="43" cy="30" r="2"/><circle cx="58" cy="24" r="2"/><circle cx="75" cy="32" r="2"/></g></svg>;
  if (visualKind === 'fries') return <svg {...common}><path d="M28 27h12v27H28zM46 17h12v37H46zM64 22h12v32H64zM82 27h12v27H82z" fill="#f3bd35" stroke="#d4931f" strokeWidth="2"/><path d="M23 48h74l-8 34H31z" fill="#c83a2d"/><path d="M39 57v15M59 57v15M79 57v15" stroke="#fff" strokeWidth="3" opacity=".9"/></svg>;
  if ((label || '').toLocaleLowerCase('pl').includes('woda')) return <svg {...common}><path d="M47 13h26v10l8 12v43c0 5-4 8-9 8H48c-5 0-9-3-9-8V35l8-12z" fill="#eefaff" stroke="#8bb7ce" strokeWidth="4"/><path d="M43 50h34v27H43z" fill="#9fd9eb" opacity=".8"/><path d="M48 12h24v9H48z" fill="#3387a5"/><path d="M50 32v12" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (visualKind === 'drink') return <svg {...common}><path d="M34 24h54l-6 60H40z" fill="#f7f4ef" stroke="#d8d2c8" strokeWidth="3"/><path d="M38 47h46l-3 32H42z" fill="#d04432"/><path d="M56 20 71 8" stroke="#b88a5d" strokeWidth="5" strokeLinecap="round"/><path d="M45 54h32" stroke="#fff" strokeWidth="4" opacity=".8"/></svg>;
  if (visualKind === 'meal') return <svg {...common}><g transform="translate(0 2) scale(.72 .72)"><path d="M18 47c0-17 18-31 42-31s42 14 42 31v5H18z" fill="#d99b42"/><path d="M18 48h84v9H18z" fill="#5a8c3f"/><path d="M18 57h84v8H18z" fill="#efbf38"/><path d="M18 65h84v8H18z" fill="#6b3424"/><path d="M20 73h80c-2 9-14 13-40 13S22 82 20 73" fill="#d99b42"/></g><g transform="translate(53 15) scale(.52)"><path d="M28 27h12v27H28zM46 17h12v37H46zM64 22h12v32H64zM82 27h12v27H82z" fill="#f3bd35"/><path d="M23 48h74l-8 34H31z" fill="#c83a2d"/></g><g transform="translate(80 34) scale(.45)"><path d="M34 24h54l-6 60H40z" fill="#d04432"/></g></svg>;
  if (visualKind === 'bag') return <svg {...common}><path d="M24 31h72l-6 53H30z" fill="#f4bd35"/><path d="M42 35v-8c0-11 7-18 18-18s18 7 18 18v8" fill="none" stroke="#7d5323" strokeWidth="6" strokeLinecap="round"/><path d="M42 50h36" stroke="#fff" strokeWidth="5"/></svg>;
  if (visualKind === 'card') return <svg {...common}><rect x="15" y="20" width="90" height="56" rx="8" fill="#3d454c"/><path d="M15 36h90" stroke="#f3bd35" strokeWidth="9"/><rect x="27" y="55" width="22" height="12" rx="2" fill="#d5c18f"/><path d="M67 61h23" stroke="#b8c0c5" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (visualKind === 'home') return <svg {...common}><path d="m18 45 42-31 42 31v37H66V57H48v25H18z" fill="#d7d2c9"/><path d="M10 45 60 8l50 37" fill="none" stroke="#bc2e24" strokeWidth="8" strokeLinejoin="round"/></svg>;
  if (visualKind === 'accessibility') return <svg {...common}><circle cx="59" cy="15" r="8" fill="#484848"/><path d="M57 28 43 42l9 11-6 21M58 31l19 5 7 15M51 52l17 4 10 17" fill="none" stroke="#484848" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="50" cy="67" r="18" fill="none" stroke="#484848" strokeWidth="5"/></svg>;
  return <svg {...common}><ellipse cx="60" cy="52" rx="48" ry="29" fill="#f4f1eb" stroke="#d9d5ce" strokeWidth="5"/><path d="M30 52c4-15 15-22 30-22s26 7 30 22" fill="#75a74f"/><path d="M29 55h62v8H29z" fill="#d69b43"/><path d="M35 65c8 8 42 8 50 0" fill="none" stroke="#6a3928" strokeWidth="7" strokeLinecap="round"/></svg>;
};
