import type { Ingredient, Product } from '../data/products';

export const getDisplayedIngredients = (product: Product, customIngredients?: Ingredient[]): Ingredient[] => {
  if (customIngredients?.length) return customIngredients;
  if (product.ingredients?.length) return product.ingredients;
  if (product.id.startsWith('sauce-')) return [];
  if (product.category === 'napoje' || product.category === 'kawy') return [];
  if (product.category === 'frytki') {
    return product.id === 'salad-side'
      ? [
          { id: 'lettuce', name: 'Sałata', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
          { id: 'tomato', name: 'Pomidor', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
        ]
      : [
          { id: 'potato', name: 'Ziemniaki', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
          { id: 'salt', name: 'Sól', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 },
        ];
  }
  if (product.category === 'kurczaki') {
    return [{ id: 'chicken', name: 'Kurczak', image: 'category', quantity: 1, maxQuantity: 1, minQuantity: 1 }];
  }
  if (product.category === 'desery') {
    return [{ id: 'dessert', name: product.name, image: product.image, quantity: 1, maxQuantity: 1, minQuantity: 1 }];
  }
  return [];
};
