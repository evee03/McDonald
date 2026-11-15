import React from 'react';

type IngredientIconProps = { id: string; label: string };

export const IngredientIcon: React.FC<IngredientIconProps> = ({ id, label }) => {
  const visualId = id.startsWith('sauce-') ? id.slice('sauce-'.length) : id;

  if (id === 'salad') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M7 25h34c-1 12-8 18-17 18S8 37 7 25Z" fill="#e9edf0" stroke="#aeb8bd" strokeWidth="2" /><path d="M9 25c2-9 8-14 14-8 6-8 13-2 16 8-7 5-23 5-30 0Z" fill="#75a74f" stroke="#4d7b35" strokeWidth="2" /><circle cx="18" cy="21" r="2" fill="#dc5140" /><circle cx="29" cy="19" r="2" fill="#f3c441" /></svg>;
  }

  if (id === 'chicken') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M11 30c0-10 8-18 18-18 7 0 12 5 12 11 0 8-8 15-18 15-7 0-12-3-12-8Z" fill="#e9a934" stroke="#c57d20" strokeWidth="2" /><circle cx="23" cy="24" r="2" fill="#f7cf71" /><circle cx="32" cy="29" r="2" fill="#f7cf71" /></svg>;
  }

  if (id === 'potato') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M9 29 15 13h8v16h5V10h8v19h5l-4 9H13z" fill="#f3bd35" stroke="#d4931f" strokeWidth="2" /></svg>;
  }

  if (id === 'salt') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M14 18h20l-3 24H17z" fill="#e9edf0" stroke="#aeb8bd" strokeWidth="2" /><path d="M17 18h14V12H17z" fill="#d7d2c9" stroke="#aeb8bd" strokeWidth="2" /><circle cx="21" cy="15" r="1" fill="#777"/><circle cx="26" cy="15" r="1" fill="#777"/></svg>;
  }

  if (id === 'drink' || id === 'coffee' || id === 'dessert') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M13 13h22l-3 29H16z" fill={id === 'coffee' ? '#c18a57' : id === 'dessert' ? '#fff9ef' : '#d04432'} stroke="#875b39" strokeWidth="2" /><path d="M17 21h14" stroke="#f7f4ef" strokeWidth="3" strokeLinecap="round" /></svg>;
  }

  if (id === 'no-sauce') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M12 24h24" stroke="#8f8f8f" strokeWidth="4" strokeLinecap="round" /></svg>;
  }

  if (id === 'cheese' || id === 'cheese-top') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M5 17 37 7l7 6v27H5z" fill="#f3c441" stroke="#d99a20" strokeWidth="2"/><circle cx="17" cy="25" r="2.5" fill="#fff0a8"/><circle cx="33" cy="19" r="2" fill="#fff0a8"/><circle cx="29" cy="34" r="2.5" fill="#fff0a8"/></svg>;
  }

  if (id === 'lettuce' || id === 'tomato' || id === 'patty') {
    if (id === 'tomato') return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><circle cx="25" cy="26" r="16" fill="#dc5140"/><path d="m24 10 3 6 7-3-3 7 7 2-7 3-3-6-5 5-1-7-7 1 5-6z" fill="#51864d"/></svg>;
    if (id === 'lettuce') return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M7 34C7 19 17 8 39 8c1 20-9 32-24 32-4 0-7-2-8-6Z" fill="#6eaa52"/><path d="M10 38 31 15M19 29l-1-10M25 23l9 1" fill="none" stroke="#477b3f" strokeWidth="2.4" strokeLinecap="round"/></svg>;
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><ellipse cx="24" cy="26" rx="18" ry="13" fill="#75442f"/><path d="M11 24h26M14 30h20" stroke="#9d6849" strokeWidth="2.5" strokeLinecap="round"/><circle cx="17" cy="20" r="1.5" fill="#d6ad74"/><circle cx="30" cy="31" r="1.5" fill="#d6ad74"/></svg>;
  }

  if (id === 'bacon') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M9 12c8 0 5 8 13 8s5-8 13-8 5 8 8 8v11c-8 0-5 8-13 8s-5-8-13-8-5 8-13 8V20c8 0 5-8 5-8Z" fill="#d97862" stroke="#a84b3a" strokeWidth="2"/><path d="M12 20c6 0 6 7 13 7s7-7 14-7M9 31c6 0 6-6 13-6" fill="none" stroke="#f4c2a5" strokeWidth="3" strokeLinecap="round"/></svg>;
  }

  if (id === 'bun') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M6 27C6 16 14 8 24 8s18 8 18 19v4H6z" fill="#dba257" stroke="#b87835" strokeWidth="2"/><path d="M7 31h34v8H7z" fill="#c9863d" stroke="#a9682d" strokeWidth="2"/><path d="M9 34h30" stroke="#f0c77f" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="17" r="1.2" fill="#fff0c4"/><circle cx="25" cy="13" r="1.2" fill="#fff0c4"/><circle cx="33" cy="19" r="1.2" fill="#fff0c4"/></svg>;
  }

  if (id === 'pickles') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><ellipse cx="18" cy="25" rx="8" ry="16" transform="rotate(-22 18 25)" fill="#79a94e"/><ellipse cx="31" cy="24" rx="8" ry="15" transform="rotate(18 31 24)" fill="#679746"/><g fill="#d0df87"><circle cx="15" cy="18" r="1.3"/><circle cx="20" cy="28" r="1.3"/><circle cx="30" cy="17" r="1.3"/><circle cx="33" cy="27" r="1.3"/></g></svg>;
  }

  if (id === 'onion') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><circle cx="24" cy="24" r="17" fill="#f6f2ed" stroke="#c7b6a7" strokeWidth="3"/><circle cx="24" cy="24" r="10" fill="none" stroke="#d7a7a3" strokeWidth="3"/><circle cx="24" cy="24" r="3" fill="#d7a7a3"/></svg>;
  }

  if (
    visualId === 'sauce'
    || visualId === 'habanero'
    || visualId === 'ketchup'
    || visualId === 'mustard'
    || visualId === 'blue-cheese'
    || visualId === 'sweet-spicy'
    || visualId === 'dragon-chili'
    || visualId === 'szechuan'
    || visualId === 'truffle-cheese'
    || visualId === 'honey-mustard'
    || visualId === 'sesame-korean'
    || visualId === 'sour-cream'
    || visualId === 'sweet-sour'
    || visualId === 'bbq'
    || visualId === 'garlic'
    || visualId === 'sriracha'
  ) {
    const sauceColor =
      visualId === 'mustard' || visualId === 'honey-mustard' ? '#e9bb32'
        : visualId === 'blue-cheese' || visualId === 'truffle-cheese' || visualId === 'sour-cream' ? '#e5ddd0'
          : visualId === 'sweet-sour' || visualId === 'sesame-korean' ? '#d2763c'
            : visualId === 'dragon-chili' || visualId === 'sriracha' || visualId === 'habanero' ? '#d84c36'
              : visualId === 'garlic' ? '#f0e2c2'
                : '#b84232';
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M24 6C19 15 10 24 10 32a14 14 0 0 0 28 0c0-8-9-17-14-26Z" fill={sauceColor}/><path d="M17 32c0 4 3 7 7 7" fill="none" stroke="#fff2dc" strokeWidth="2.5" strokeLinecap="round"/></svg>;
  }

  return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><circle cx="24" cy="24" r="17" fill="#f0eee9" stroke="#d7d2c9" strokeWidth="2"/><path d="M12 26c6-12 16-13 24-5-2 12-12 18-24 5Z" fill="#77a851"/><path d="m15 31 17-14" stroke="#4f803e" strokeWidth="2" strokeLinecap="round"/></svg>;
};
