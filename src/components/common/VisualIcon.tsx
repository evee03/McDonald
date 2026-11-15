import React from 'react';

type VisualKind = 'burger' | 'fries' | 'drink' | 'meal' | 'bag' | 'card' | 'home' | 'category' | 'accessibility' | 'dine-in';

const resolveKind = (value = ''): VisualKind => {
  if (['burger', 'fries', 'drink', 'meal', 'bag', 'card', 'home', 'category', 'accessibility', 'dine-in'].includes(value)) {
    return value as VisualKind;
  }
  return 'category';
};

export const VisualIcon: React.FC<{ kind?: string; className?: string; label?: string; photoKey?: string }> = ({
  kind,
  className,
  label,
  photoKey,
}) => {
  const supportedKinds = ['burger', 'fries', 'drink', 'meal', 'bag', 'card', 'home', 'category', 'dine-in'];
  const visualKind = (supportedKinds.includes(kind || '') ? kind : resolveKind(kind || label)) as VisualKind;
  const visualKey = photoKey || kind || label || '';
  const common = {
    className: `visual-icon-svg ${className || ''}`,
    viewBox: '0 0 120 90',
    role: 'img' as const,
    'aria-label': label || visualKind,
  };

  const categoryLabel = (label || '').toLocaleLowerCase('pl');
  if (categoryLabel.includes('kurczak')) {
    return <svg {...common}><ellipse cx="60" cy="76" rx="43" ry="7" fill="#e5e1db" /><g fill="#e9a934" stroke="#c57d20" strokeWidth="2"><path d="M22 59c3-14 17-22 31-15l8 7c-5 10-17 18-31 16z" /><path d="M48 54c5-15 19-20 32-11l7 8c-5 10-18 17-32 14z" /><path d="M68 64c4-13 18-18 30-10l5 8c-7 9-19 13-31 10z" /></g></svg>;
  }
  if (categoryLabel.includes('sałat')) {
    return <svg {...common}><path d="M16 38h88c-3 27-19 39-44 39S19 65 16 38Z" fill="#e9edf0" stroke="#aeb8bd" strokeWidth="3" /><path d="M20 38c4-19 16-27 28-14 12-17 29-8 36 14-16 10-48 10-64 0Z" fill="#75a74f" stroke="#4d7b35" strokeWidth="3" /><circle cx="42" cy="31" r="4" fill="#dc5140" /><circle cx="69" cy="28" r="4" fill="#f3c441" /></svg>;
  }
  if (categoryLabel.includes('wrap')) {
    return <svg {...common}><path d="M27 16h58l-8 64H35z" fill="#d9a24b" stroke="#ad7130" strokeWidth="3" /><path d="M30 43c14-10 34-10 52 0M34 57c12-8 29-8 44 0" fill="none" stroke="#75a74f" strokeWidth="8" strokeLinecap="round" /><path d="M39 68h34" stroke="#dc5140" strokeWidth="5" strokeLinecap="round" /></svg>;
  }
  if (categoryLabel.includes('deser') || categoryLabel.includes('lody')) {
    return <svg {...common}><path d="M31 38h58l-7 43H38z" fill="#e9edf0" stroke="#b9c3ca" strokeWidth="3" /><path d="M35 39c7-21 17-23 25-8 9-16 20-9 24 8-7 10-40 12-49 0z" fill="#fff9ef" stroke="#ded4c5" strokeWidth="3" /><path d="M42 45c7 7 28 7 37 0" fill="none" stroke="#6f2e21" strokeWidth="6" strokeLinecap="round" /></svg>;
  }

  if (visualKey.includes('crispy') || visualKey.includes('chicken-wings') || visualKey.includes('spicy-crispy')) {
    return <svg {...common}><ellipse cx="60" cy="76" rx="43" ry="7" fill="#e5e1db" /><g fill="#e9a934" stroke="#c57d20" strokeWidth="2"><path d="M22 59c3-14 17-22 31-15l8 7c-5 10-17 18-31 16z" /><path d="M48 54c5-15 19-20 32-11l7 8c-5 10-18 17-32 14z" /><path d="M68 64c4-13 18-18 30-10l5 8c-7 9-19 13-31 10z" /></g></svg>;
  }

  if (visualKey.includes('latte') || visualKey.includes('cappuccino') || visualKey.includes('flat-white')) {
    return <svg {...common}><path d="M37 20h46l-5 63H42z" fill="#c18a57" stroke="#875b39" strokeWidth="3" /><path d="M37 20h46l-3 15H39z" fill="#f3eadb" /><path d="M43 27c6-6 10 6 16 0s10 6 16 0" fill="none" stroke="#fff9ee" strokeWidth="4" strokeLinecap="round" /><path d="M50 54h20" stroke="#e1b481" strokeWidth="4" strokeLinecap="round" /><path d="M45 83h30" stroke="#6c452d" strokeWidth="3" strokeLinecap="round" /></svg>;
  }

  if (visualKey.includes('sundae') || visualKey.includes('apple-pie')) {
    if (visualKey.includes('apple-pie')) {
      return <svg {...common}><path d="M24 42 91 27l8 28-68 17z" fill="#efe9dd" stroke="#c8bda9" strokeWidth="3" /><path d="M30 46c-2-12 9-22 23-19 10 2 17 10 17 20 0 11-10 19-22 20-10 1-17-8-18-21z" fill="#d9983d" stroke="#b36b25" strokeWidth="3" /><path d="M39 48c5-7 12 3 19-3" fill="none" stroke="#f4d18a" strokeWidth="4" strokeLinecap="round" /></svg>;
    }
    return <svg {...common}><path d="M31 38h58l-7 43H38z" fill="#e9edf0" stroke="#b9c3ca" strokeWidth="3" /><path d="M35 39c7-21 17-23 25-8 9-16 20-9 24 8-7 10-40 12-49 0z" fill="#fff9ef" stroke="#ded4c5" strokeWidth="3" /><path d="M42 45c7 7 28 7 37 0" fill="none" stroke="#6f2e21" strokeWidth="6" strokeLinecap="round" /><path d="M35 67h49" stroke="#55a9d8" strokeWidth="5" /></svg>;
  }

  if (visualKind === 'dine-in') return <svg {...common}><path d="M16 65h88l-8 10H24z" fill="#b52d29" /><path d="M28 56h64l-7 12H35z" fill="#6aa84f" /><path d="M39 32h45l10 28H31z" fill="#76503d" /><path d="M44 38h36l6 14H39z" fill="#a96c45" /></svg>;

  if (['beef', 'cheese', 'pickles', 'sauce', 'lettuce'].includes(visualKey)) {
    if (visualKey === 'cheese') {
      return <svg {...common}><path d="M22 30h76v35H22z" fill="#f3c448" stroke="#c79225" strokeWidth="3" /><path d="m22 30 25 15 24-15 27 15" fill="none" stroke="#ffe59a" strokeWidth="3" /></svg>;
    }
    if (visualKey === 'pickles') {
      return <svg {...common}><path d="M42 72c-9-13-8-35 3-46 8-8 22-4 26 6 6 16-2 37-15 45z" fill="#75a74f" stroke="#4d7b35" strokeWidth="3" /><path d="M49 34 61 67M59 31 68 59" stroke="#b6d477" strokeWidth="3" strokeLinecap="round" /></svg>;
    }
    if (visualKey === 'sauce') {
      return <svg {...common}><path d="M35 37h50l-5 42H40z" fill="#e6e1d8" stroke="#aaa39a" strokeWidth="3" /><path d="M38 43h44v30H38z" fill="#c83a2d" /><path d="M31 34h58" stroke="#777" strokeWidth="5" strokeLinecap="round" /></svg>;
    }
    if (visualKey === 'lettuce') {
      return <svg {...common}><path d="M22 57c5-23 27-32 43-18 17-11 34 1 33 20-1 18-21 25-39 17-18 8-40 1-37-19z" fill="#75a74f" stroke="#4d7b35" strokeWidth="3" /><path d="M42 43c11 9 23 14 40 7" fill="none" stroke="#b6d477" strokeWidth="4" strokeLinecap="round" /></svg>;
    }
    return <svg {...common}><path d="M22 57c0-15 17-25 38-25s38 10 38 25c0 12-17 20-38 20S22 69 22 57z" fill="#6b3424" stroke="#492219" strokeWidth="3" /><path d="M32 54h56M36 64h48" stroke="#9e5536" strokeWidth="3" strokeLinecap="round" /></svg>;
  }

  if (visualKind === 'burger') return <svg {...common}><ellipse cx="60" cy="78" rx="45" ry="7" fill="#e5e1db" /><path d="M18 47c0-17 18-31 42-31s42 14 42 31v5H18z" fill="#d99b42" /><path d="M18 48h84v9H18z" fill="#5a8c3f" /><path d="M18 57h84v8H18z" fill="#efbf38" /><path d="M18 65h84v8H18z" fill="#6b3424" /><path d="M20 73h80c-2 9-14 13-40 13S22 82 20 73" fill="#d99b42" /><g fill="#fff1c9"><circle cx="43" cy="30" r="2" /><circle cx="58" cy="24" r="2" /><circle cx="75" cy="32" r="2" /></g></svg>;
  if (visualKind === 'fries') return <svg {...common}><path d="M28 27h12v27H28zM46 17h12v37H46zM64 22h12v32H64zM82 27h12v27H82z" fill="#f3bd35" stroke="#d4931f" strokeWidth="2" /><path d="M23 48h74l-8 34H31z" fill="#c83a2d" /><path d="M39 57v15M59 57v15M79 57v15" stroke="#fff" strokeWidth="3" opacity=".9" /></svg>;
  if (visualKey.includes('water') || (label || '').toLocaleLowerCase('pl').includes('woda')) return <svg {...common}><path d="M47 13h26v10l8 12v43c0 5-4 8-9 8H48c-5 0-9-3-9-8V35l8-12z" fill="#eefaff" stroke="#8bb7ce" strokeWidth="4" /><path d="M43 50h34v27H43z" fill="#9fd9eb" opacity=".8" /><path d="M48 12h24v9H48z" fill="#3387a5" /><path d="M50 32v12" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></svg>;
  if (visualKey.includes('fanta') || (label || '').toLocaleLowerCase('pl').includes('pomarańcz')) return <svg {...common}><path d="M34 24h54l-6 60H40z" fill="#f3f0e8" stroke="#d1c7b8" strokeWidth="3" /><path d="M38 47h46l-3 32H42z" fill="#ed8b26" /><path d="M56 20 71 8" stroke="#b88a5d" strokeWidth="5" strokeLinecap="round" /><path d="M45 54h32" stroke="#fff5d8" strokeWidth="4" opacity=".9" /><circle cx="60" cy="64" r="7" fill="#f7b84a" opacity=".75" /></svg>;
  if (visualKind === 'drink') return <svg {...common}><path d="M34 24h54l-6 60H40z" fill="#f7f4ef" stroke="#d8d2c8" strokeWidth="3" /><path d="M38 47h46l-3 32H42z" fill="#d04432" /><path d="M56 20 71 8" stroke="#b88a5d" strokeWidth="5" strokeLinecap="round" /><path d="M45 54h32" stroke="#fff" strokeWidth="4" opacity=".8" /></svg>;
  if (visualKind === 'meal') return <svg {...common}><g transform="translate(0 2) scale(.72 .72)"><path d="M18 47c0-17 18-31 42-31s42 14 42 31v5H18z" fill="#d99b42" /><path d="M18 48h84v9H18z" fill="#5a8c3f" /><path d="M18 57h84v8H18z" fill="#efbf38" /><path d="M18 65h84v8H18z" fill="#6b3424" /><path d="M20 73h80c-2 9-14 13-40 13S22 82 20 73" fill="#d99b42" /></g><g transform="translate(53 15) scale(.52)"><path d="M28 27h12v27H28zM46 17h12v37H46zM64 22h12v32H64zM82 27h12v27H82z" fill="#f3bd35" /><path d="M23 48h74l-8 34H31z" fill="#c83a2d" /></g><g transform="translate(80 34) scale(.45)"><path d="M34 24h54l-6 60H40z" fill="#d04432" /></g></svg>;
  if (visualKind === 'bag') return <svg {...common}><path d="M24 31h72l-6 53H30z" fill="#f4bd35" /><path d="M42 35v-8c0-11 7-18 18-18s18 7 18 18v8" fill="none" stroke="#7d5323" strokeWidth="6" strokeLinecap="round" /><path d="M42 50h36" stroke="#fff" strokeWidth="5" /></svg>;
  if (visualKind === 'card') return <svg {...common}><rect x="15" y="20" width="90" height="56" rx="8" fill="#3d454c" /><path d="M15 36h90" stroke="#f3bd35" strokeWidth="9" /><rect x="27" y="55" width="22" height="12" rx="2" fill="#d5c18f" /><path d="M67 61h23" stroke="#b8c0c5" strokeWidth="4" strokeLinecap="round" /></svg>;
  if (visualKind === 'home') return <svg {...common}><path d="m18 45 42-31 42 31v37H66V57H48v25H18z" fill="#d7d2c9" /><path d="M10 45 60 8l50 37" fill="none" stroke="#bc2e24" strokeWidth="8" strokeLinejoin="round" /></svg>;
  if (visualKind === 'accessibility') return <svg {...common}><circle cx="59" cy="15" r="8" fill="#484848" /><path d="M57 28 43 42l9 11-6 21M58 31l19 5 7 15M51 52l17 4 10 17" fill="none" stroke="#484848" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="50" cy="67" r="18" fill="none" stroke="#484848" strokeWidth="5" /></svg>;
  return <svg {...common}><ellipse cx="60" cy="52" rx="48" ry="29" fill="#f4f1eb" stroke="#d9d5ce" strokeWidth="5" /><path d="M30 52c4-15 15-22 30-22s26 7 30 22" fill="#75a74f" /><path d="M29 55h62v8H29z" fill="#d69b43" /><path d="M35 65c8 8 42 8 50 0" fill="none" stroke="#6a3928" strokeWidth="7" strokeLinecap="round" /></svg>;
};
