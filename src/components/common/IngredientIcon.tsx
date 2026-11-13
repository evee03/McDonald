import React from 'react';

type IngredientIconProps = { id: string; label: string };

export const IngredientIcon: React.FC<IngredientIconProps> = ({ id, label }) => {
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
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M6 28C6 16 14 9 24 9s18 7 18 19v6H6z" fill="#dba257"/><path d="M7 29h34M9 35h30" stroke="#f0c77f" strokeWidth="3" strokeLinecap="round"/><circle cx="18" cy="18" r="1.2" fill="#fff0c4"/><circle cx="27" cy="15" r="1.2" fill="#fff0c4"/><circle cx="33" cy="21" r="1.2" fill="#fff0c4"/></svg>;
  }

  if (id === 'pickles') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><ellipse cx="18" cy="25" rx="8" ry="16" transform="rotate(-22 18 25)" fill="#79a94e"/><ellipse cx="31" cy="24" rx="8" ry="15" transform="rotate(18 31 24)" fill="#679746"/><g fill="#d0df87"><circle cx="15" cy="18" r="1.3"/><circle cx="20" cy="28" r="1.3"/><circle cx="30" cy="17" r="1.3"/><circle cx="33" cy="27" r="1.3"/></g></svg>;
  }

  if (id === 'onion') {
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><circle cx="24" cy="24" r="17" fill="#f6f2ed" stroke="#c7b6a7" strokeWidth="3"/><circle cx="24" cy="24" r="10" fill="none" stroke="#d7a7a3" strokeWidth="3"/><circle cx="24" cy="24" r="3" fill="#d7a7a3"/></svg>;
  }

  if (id === 'sauce' || id === 'habanero' || id === 'ketchup' || id === 'mustard') {
    const sauceColor = id === 'mustard' ? '#e9bb32' : id === 'habanero' ? '#d84c36' : '#b84232';
    return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><path d="M24 6C19 15 10 24 10 32a14 14 0 0 0 28 0c0-8-9-17-14-26Z" fill={sauceColor}/><path d="M17 32c0 4 3 7 7 7" fill="none" stroke="#fff2dc" strokeWidth="2.5" strokeLinecap="round"/></svg>;
  }

  return <svg className="ingredient-visual" viewBox="0 0 48 48" role="img" aria-label={label}><circle cx="24" cy="24" r="17" fill="#f0eee9" stroke="#d7d2c9" strokeWidth="2"/><path d="M12 26c6-12 16-13 24-5-2 12-12 18-24 5Z" fill="#77a851"/><path d="m15 31 17-14" stroke="#4f803e" strokeWidth="2" strokeLinecap="round"/></svg>;
};
