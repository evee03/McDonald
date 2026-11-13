/**
 * Dane produktów menu kiosku — neutralne nazwy (bez oryginalnych znaków towarowych).
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string; // identyfikator ilustracji produktu
  category: string;
  isNew?: boolean;
  isDeal?: boolean;
  description?: string;
  allergens?: string;
  nutritionPer100g?: {
    energy: string;
    fat: string;
    saturatedFat: string;
    carbs: string;
    sugar: string;
    fiber: string;
    protein: string;
    salt: string;
  };
  ingredients?: Ingredient[];
  canBeCombo?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  image: string;
  quantity: number;
  maxQuantity: number;
  minQuantity: number;
}

export interface ComboOption {
  id: string;
  name: string;
  priceAdd: number;
  image: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

// Kategorie menu
export const menuCategories: MenuCategory[] = [
  { id: 'menu-glowne', name: 'Menu Główne', icon: 'home' },
  { id: 'super-oferta', name: 'Super Oferta', icon: 'category' },
  { id: 'nowosci', name: 'Nowości', icon: 'category' },
  { id: 'zestawy', name: 'Zestawy', icon: 'meal' },
  { id: 'burgery', name: 'Burgery', icon: 'burger' },
  { id: 'wrapy', name: 'Wrapy i Sałatki', icon: 'category' },
  { id: 'kurczaki', name: 'Kurczaki', icon: 'category' },
  { id: 'frytki', name: 'Frytki i Dodatki', icon: 'fries' },
  { id: 'napoje', name: 'Napoje', icon: 'drink' },
  { id: 'kawy', name: 'Kawiarnia', icon: 'drink' },
  { id: 'desery', name: 'Lody i Desery', icon: 'category' },
];

// Produkty
export const products: Product[] = [
  // Burgery
  {
    id: 'classic-burger',
    name: 'Klasyczny Burger',
    price: 22.80,
    image: 'burger',
    category: 'burgery',
    description: 'Podwójne mięso wołowe, sos specjalny, sałata, ser, ogórki, cebula, bułka sezamowa.',
    canBeCombo: true,
    allergens: 'Produkt zawiera: gluten pszenny, mleko, gorczyca, ziarna sezamu, jaja. Może zawierać: soja.',
    nutritionPer100g: {
      energy: '965kJ / 231kcal',
      fat: '12g',
      saturatedFat: '4,4g',
      carbs: '18g',
      sugar: '3,7g',
      fiber: '1,7g',
      protein: '12g',
      salt: '0,98g',
    },
    ingredients: [
      { id: 'beef', name: 'Mięso wołowe', image: 'category', quantity: 2, maxQuantity: 3, minQuantity: 0 },
      { id: 'bun', name: 'Bułka pszenna', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
      { id: 'sauce', name: 'Sos specjalny', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'lettuce', name: 'Sałata lodowa krojona', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'cheese', name: 'Ser cheddar topiony', image: 'category', quantity: 1, maxQuantity: 3, minQuantity: 0 },
      { id: 'pickles', name: 'Pikle', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'onion', name: 'Cebula suszona', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
    ],
  },
  {
    id: 'spicy-crispy',
    name: 'Pikantny Chrupiący',
    price: 21.90,
    image: 'burger',
    category: 'burgery',
    isNew: true,
    canBeCombo: true,
    allergens: 'Produkt zawiera: gluten pszenny, mleko, jaja. Może zawierać: soja, gorczyca.',
    ingredients: [
      { id: 'chicken', name: 'Panierowane mięso z piersi kurczaka', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
      { id: 'habanero', name: 'Sos Habanero', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'cheese-top', name: 'Ser cheddar topiony', image: 'category', quantity: 1, maxQuantity: 3, minQuantity: 0 },
      { id: 'pickles', name: 'Pikle', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
    ],
  },
  {
    id: 'bacon-supreme',
    name: 'Bekonowy Supreme',
    price: 25.90,
    image: 'burger',
    category: 'burgery',
    canBeCombo: true,
    isDeal: true,
    ingredients: [
      { id: 'beef', name: 'Mięso wołowe', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 1 },
      { id: 'bacon', name: 'Bekon', image: 'category', quantity: 2, maxQuantity: 3, minQuantity: 0 },
      { id: 'cheese', name: 'Ser cheddar', image: 'category', quantity: 1, maxQuantity: 3, minQuantity: 0 },
      { id: 'onion', name: 'Cebula prażona', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'sauce', name: 'Sos BBQ', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
    ],
  },
  {
    id: 'cheeseburger',
    name: 'Serowy Burger',
    price: 7.50,
    image: 'burger',
    category: 'burgery',
    canBeCombo: true,
    isDeal: true,
    ingredients: [
      { id: 'beef', name: 'Mięso wołowe', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 1 },
      { id: 'cheese', name: 'Ser cheddar', image: 'category', quantity: 1, maxQuantity: 3, minQuantity: 0 },
      { id: 'pickles', name: 'Pikle', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'ketchup', name: 'Ketchup', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'mustard', name: 'Musztarda', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'onion', name: 'Cebula', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
    ],
  },
  {
    id: 'veggie-burger',
    name: 'Burger Wege Deluxe',
    price: 23.90,
    image: 'burger',
    category: 'burgery',
    isNew: true,
    canBeCombo: true,
    ingredients: [
      { id: 'patty', name: 'Kotlet roślinny', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 1 },
      { id: 'lettuce', name: 'Sałata', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'tomato', name: 'Pomidor', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
      { id: 'sauce', name: 'Sos musztardowo-miodowy', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
    ],
  },

  // Kurczaki
  {
    id: 'crispy-strips-3',
    name: 'Chrupiące Stripsy 3 szt.',
    price: 13.90,
    image: 'category',
    category: 'kurczaki',
    isNew: true,
    canBeCombo: false,
  },
  {
    id: 'crispy-strips-5',
    name: 'Chrupiące Stripsy 5 szt.',
    price: 5.00,
    image: 'category',
    category: 'kurczaki',
    isNew: true,
    canBeCombo: false,
  },
  {
    id: 'chicken-wings-6',
    name: 'Skrzydełka 6 szt.',
    price: 16.90,
    image: 'category',
    category: 'kurczaki',
    canBeCombo: false,
  },

  // Frytki i dodatki
  {
    id: 'fries-medium',
    name: 'Frytki Średnie',
    price: 9.90,
    image: 'fries',
    category: 'frytki',
  },
  {
    id: 'fries-large',
    name: 'Frytki Duże',
    price: 11.90,
    image: 'fries',
    category: 'frytki',
  },
  {
    id: 'salad-side',
    name: 'Sałatka',
    price: 8.90,
    image: 'category',
    category: 'frytki',
  },

  // Napoje
  {
    id: 'cola',
    name: 'Napój Cola',
    price: 8.50,
    image: 'drink',
    category: 'napoje',
  },
  {
    id: 'cola-zero',
    name: 'Napój Cola Zero',
    price: 8.50,
    image: 'drink',
    category: 'napoje',
    isDeal: true,
  },
  {
    id: 'sprite',
    name: 'Napój Cytrynowy',
    price: 8.50,
    image: 'drink',
    category: 'napoje',
    isNew: true,
  },
  {
    id: 'fanta',
    name: 'Napój Pomarańczowy',
    price: 8.50,
    image: 'drink',
    category: 'napoje',
  },
  {
    id: 'ice-tea',
    name: 'Mrożona Herbata',
    price: 8.50,
    image: 'drink',
    category: 'napoje',
  },
  {
    id: 'water-sparkling',
    name: 'Woda Gazowana',
    price: 6.00,
    image: 'drink',
    category: 'napoje',
  },
  {
    id: 'water-still',
    name: 'Woda Niegazowana',
    price: 6.00,
    image: 'drink',
    category: 'napoje',
  },

  // Kawy
  {
    id: 'latte-small',
    name: 'Café Latte Mała',
    price: 10.00,
    image: 'drink',
    category: 'kawy',
  },
  {
    id: 'cappuccino-small',
    name: 'Cappuccino Małe',
    price: 10.00,
    image: 'drink',
    category: 'kawy',
  },
  {
    id: 'flat-white',
    name: 'Flat White Mały',
    price: 10.00,
    image: 'drink',
    category: 'kawy',
  },

  // Desery
  {
    id: 'sundae-caramel',
    name: 'Lody Karmelowe',
    price: 11.50,
    image: 'category',
    category: 'desery',
    isNew: true,
  },
  {
    id: 'apple-pie',
    name: 'Ciastko Jabłko',
    price: 9.20,
    image: 'category',
    category: 'desery',
    isDeal: true,
  },

  // Sosy (jako dodatki)
  {
    id: 'sauce-sweet-spicy',
    name: 'Sos Sweet & Spicy',
    price: 1.90,
    image: 'category',
    category: 'frytki',
    isNew: true,
  },
  {
    id: 'sauce-dragon-chili',
    name: 'Sos Dragon Chili',
    price: 1.90,
    image: 'category',
    category: 'frytki',
    isNew: true,
  },
  {
    id: 'sauce-blue-cheese',
    name: 'Sos Blue Cheese',
    price: 1.90,
    image: 'category',
    category: 'frytki',
    isNew: true,
  },
];

// Sosy do frytek w zestawie
export const frySauces: ComboOption[] = [
  { id: 'ketchup', name: 'Ketchup', priceAdd: 0, image: 'category' },
  { id: 'no-sauce', name: 'Bez sosu', priceAdd: 0, image: 'category' },
  { id: 'blue-cheese', name: 'Sos Blue Cheese', priceAdd: 1.90, image: 'category' },
  { id: 'sweet-spicy', name: 'Sos Sweet & Spicy', priceAdd: 1.90, image: 'category' },
  { id: 'dragon-chili', name: 'Sos Dragon Chili', priceAdd: 1.90, image: 'category' },
  { id: 'szechuan', name: 'Sos Szechuan Style', priceAdd: 1.90, image: 'category' },
  { id: 'truffle-cheese', name: 'Sos Truffle Cheese', priceAdd: 1.90, image: 'category' },
  { id: 'honey-mustard', name: 'Sos Honey Mustard', priceAdd: 1.90, image: 'category' },
  { id: 'sesame-korean', name: 'Sos Sesame Korean', priceAdd: 1.90, image: 'category' },
  { id: 'sour-cream', name: 'Sos Śmietanowy', priceAdd: 1.90, image: 'category' },
  { id: 'sweet-sour', name: 'Sos Słodko-Kwaśny', priceAdd: 1.90, image: 'category' },
  { id: 'bbq', name: 'Sos Barbecue', priceAdd: 1.90, image: 'category' },
  { id: 'garlic', name: 'Sos Czosnkowy', priceAdd: 1.90, image: 'category' },
  { id: 'sriracha', name: 'Sriracha Mayo', priceAdd: 1.90, image: 'category' },
];

// Napoje do zestawu
export const comboDrinks: ComboOption[] = [
  { id: 'sprite-sakura', name: 'Napój Sakura', priceAdd: 2.00, image: 'drink' },
  { id: 'cola', name: 'Napój Cola', priceAdd: 0, image: 'drink' },
  { id: 'cola-zero', name: 'Napój Cola Zero', priceAdd: 0, image: 'drink' },
  { id: 'sprite', name: 'Napój Cytrynowy', priceAdd: 0, image: 'drink' },
  { id: 'fanta', name: 'Napój Pomarańczowy', priceAdd: 0, image: 'category' },
  { id: 'ice-tea', name: 'Mrożona Herbata', priceAdd: 0, image: 'drink' },
  { id: 'water-sparkling', name: 'Woda Gazowana', priceAdd: 0, image: 'drink' },
  { id: 'water-still', name: 'Woda Niegazowana', priceAdd: 0, image: 'drink' },
  { id: 'latte', name: 'Café Latte Mała', priceAdd: 2.00, image: 'drink' },
  { id: 'cappuccino', name: 'Cappuccino Małe', priceAdd: 2.00, image: 'drink' },
  { id: 'flat-white', name: 'Flat White Mały', priceAdd: 2.00, image: 'drink' },
];

// Extra dodatki do zestawu
export const comboExtras: ComboOption[] = [
  { id: 'sundae-caramel', name: 'Lody Karmelowe', priceAdd: 0.90, image: 'category' },
  { id: 'no-thanks', name: 'Nie, dziękuję', priceAdd: 0, image: 'category' },
];

// Produkty upsell ("A może coś jeszcze?")
export const upsellProducts = [
  'sprite', 'crispy-strips-5', 'crispy-strips-3',
  'cola-zero', 'apple-pie', 'cheeseburger', 'sundae-caramel',
];
