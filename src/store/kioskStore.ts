/**
 * Magazyn stanu kiosku samoobsługowego (Zustand Store)
 * 
 * Odpowiada za:
 * - Scenariusz S1: wybór kafelków, konfigurację zestawu, dodanie do koszyka
 * - Scenariusz S2: modyfikację pozycji, zmianę składników, zmianę rozmiaru, przeliczanie cen
 * - Scenariusz S3: podsumowanie, NIP, darowiznę, wybór płatności, symulację terminala i skanera
 * - Tryb dostępności (obniżenie interfejsu o 50% w dół)
 * - Zarządzanie modalnymi oknami i komunikatami błędów
 */

import { create } from 'zustand';
import type {
  Product,
  Ingredient,
  ComboOption,
} from '../data/products';
import {
  frySauces,
  comboDrinks,
} from '../data/products';
import { eventLogger, type StandardAOI } from '../logger/eventLogger';

export type ScreenId =
  | 'welcome'
  | 'language-select'
  | 'dine-choice'
  | 'menu'
  | 'combo-prompt'
  | 'combo-builder'
  | 'cart'
  | 'personalize'
  | 'nip-entry'
  | 'donation'
  | 'payment-method'
  | 'payment-processing'
  | 'payment-success'
  | 'allergens'
  | 'scan-code';

export type ModalType =
  | 'none'
  | 'product-detail'
  | 'restart-confirm'
  | 'error'
  | 'product-added'
  | 'upsell'
  | 'physical-terminal'
  | 'physical-scanner';

export interface ConfiguredCombo {
  baseProduct: Product;
  size: 'standard' | 'large';
  side: 'frytki' | 'salatka';
  sauce: ComboOption;
  drink: ComboOption;
  extra?: ComboOption;
}

export interface CartItem {
  id: string;
  isCombo: boolean;
  product: Product;
  quantity: number;
  comboConfig?: ConfiguredCombo;
  customIngredients?: Ingredient[];
  calculatedUnitPrice: number;
}

interface KioskState {
  // Nawigacja
  currentScreen: ScreenId;
  previousScreen: ScreenId | null;
  activeCategory: string;
  isAccessibilityMode: boolean;

  // Aktywny modal
  activeModal: ModalType;
  errorMessage: string;
  errorAoiOrigin: string;

  // Aktywny scenariusz badawczy
  activeScenario: 'S1' | 'S2' | 'S3' | 'FREE';
  participantId: string;

  // Wybór konsumpcji i język
  dineOption: 'na-miejscu' | 'na-wynos' | null;
  currentLanguage: 'pl' | 'en' | 'de' | 'ua';

  // Wybrany produkt do podglądu / personalizacji
  selectedProduct: Product | null;
  selectedCartItemId: string | null;

  // Konfigurator zestawu (Combo Builder)
  comboStep: number; // 1: Rozmiar, 2: Dodatek, 3: Sos, 4: Napój, 5: Extra, 6: Podsumowanie
  tempCombo: ConfiguredCombo | null;

  // Personalizacja składników
  tempIngredients: Ingredient[];

  // Koszyk
  cart: CartItem[];

  // Płatność i faktura
  nipInput: string;
  donationAdded: number;
  orderNumber: number;
  paymentTerminalStep: 1 | 2 | 3 | 4; // 1: instrukcja, 2: połączenie, 3: zbliż kartę, 4: autoryzacja

  // Akcje
  navigateTo: (screen: ScreenId, aoi?: StandardAOI, label?: string) => void;
  goBack: (aoi?: StandardAOI) => void;
  toggleAccessibility: () => void;
  setScenario: (scen: 'S1' | 'S2' | 'S3' | 'FREE') => void;
  setParticipant: (id: string) => void;

  setDineOption: (opt: 'na-miejscu' | 'na-wynos') => void;
  setLanguage: (lang: 'pl' | 'en' | 'de' | 'ua') => void;
  setActiveCategory: (catId: string) => void;

  // Modale i błędy
  openModal: (modal: ModalType, metadata?: Record<string, unknown>) => void;
  closeModal: (aoi?: StandardAOI) => void;
  triggerError: (message: string, aoiOrigin?: string) => void;

  // Obsługa produktów
  openProductDetail: (product: Product) => void;
  startComboBuilder: (product: Product) => void;
  setComboSize: (size: 'standard' | 'large') => void;
  setComboSide: (side: 'frytki' | 'salatka') => void;
  setComboSauce: (sauce: ComboOption) => void;
  setComboDrink: (drink: ComboOption) => void;
  setComboExtra: (extra?: ComboOption) => void;
  setComboStep: (step: number) => void;
  finishComboBuilder: () => void;

  // Personalizacja (S2)
  openPersonalize: (product: Product, cartItemId?: string) => void;
  updateIngredientQty: (ingredientId: string, delta: number) => void;
  resetIngredients: () => void;
  savePersonalization: () => void;

  // Koszyk
  addProductToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeCartItem: (itemId: string) => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  resetAll: () => void;

  // Płatność (S3)
  setNipInput: (nip: string) => void;
  appendNipDigit: (digit: string) => void;
  backspaceNip: () => void;
  clearNip: () => void;
  submitNip: () => void;
  setDonation: (amount: number) => void;
  startCardPayment: () => void;
  advanceTerminalStep: (step: 1 | 2 | 3 | 4) => void;
  completePayment: () => void;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  // Domyślny stan
  currentScreen: 'welcome',
  previousScreen: null,
  activeCategory: 'menu-glowne',
  isAccessibilityMode: false,

  activeModal: 'none',
  errorMessage: '',
  errorAoiOrigin: 'AOI_blad',

  activeScenario: 'S1',
  participantId: 'P01',

  dineOption: null,
  currentLanguage: 'pl',

  selectedProduct: null,
  selectedCartItemId: null,

  comboStep: 1,
  tempCombo: null,

  tempIngredients: [],

  cart: [],

  nipInput: '',
  donationAdded: 0,
  orderNumber: 42,
  paymentTerminalStep: 1,

  // Nawigacja
  navigateTo: (screen, aoi = 'AOI_cel', label = `Przejście do ${screen}`) => {
    const prev = get().currentScreen;
    eventLogger.logTouch(aoi, label, {} as MouseEvent, screen);
    set({ currentScreen: screen, previousScreen: prev });
  },

  goBack: (aoi = 'AOI_wstecz') => {
    const prev = get().previousScreen || 'menu';
    eventLogger.logTouch(aoi, 'Przycisk Wstecz / Powrót', {} as MouseEvent, prev);
    set({ currentScreen: prev, previousScreen: null });
  },

  toggleAccessibility: () => {
    const nextState = !get().isAccessibilityMode;
    eventLogger.logTouch(
      'AOI_dostepnosc',
      `Przełączenie trybu dostępności na: ${nextState ? 'WŁ' : 'WYŁ'}`,
      {} as MouseEvent,
      get().currentScreen
    );
    set({ isAccessibilityMode: nextState });
  },

  setScenario: (scen) => {
    eventLogger.setScenario(scen);
    set({ activeScenario: scen });
  },

  setParticipant: (id) => {
    eventLogger.setParticipant(id);
    set({ participantId: id });
  },

  setDineOption: (opt) => set({ dineOption: opt }),
  setLanguage: (lang) => set({ currentLanguage: lang }),
  setActiveCategory: (catId) => set({ activeCategory: catId }),

  // Modale
  openModal: (modal, metadata) => {
    eventLogger.logTouch('AOI_cel', `Otwarcie modala: ${modal}`, {} as MouseEvent, get().currentScreen, metadata);
    set({ activeModal: modal });
  },

  closeModal: (aoi = 'AOI_wstecz') => {
    eventLogger.logTouch(aoi, 'Zamknięcie modala', {} as MouseEvent, get().currentScreen);
    set({ activeModal: 'none' });
  },

  triggerError: (message, aoiOrigin = 'AOI_blad') => {
    eventLogger.logError(message, get().currentScreen, { aoiOrigin });
    set({
      errorMessage: message,
      errorAoiOrigin: aoiOrigin,
      activeModal: 'error',
    });
  },

  // Produkty i Zestawy (S1)
  openProductDetail: (product) => {
    set({ selectedProduct: product, activeModal: 'product-detail' });
  },

  startComboBuilder: (product) => {
    // Inicjalizacja domyślnego zestawu
    const initialCombo: ConfiguredCombo = {
      baseProduct: product,
      size: 'standard',
      side: 'frytki',
      sauce: frySauces[0], // Ketchup
      drink: comboDrinks[1], // Cola
      extra: undefined,
    };

    set({
      selectedProduct: product,
      tempCombo: initialCombo,
      comboStep: 1,
      currentScreen: 'combo-builder',
      activeModal: 'none',
    });
  },

  setComboSize: (size) => {
    const cur = get().tempCombo;
    if (cur) set({ tempCombo: { ...cur, size } });
  },

  setComboSide: (side) => {
    const cur = get().tempCombo;
    if (cur) set({ tempCombo: { ...cur, side } });
  },

  setComboSauce: (sauce) => {
    const cur = get().tempCombo;
    if (cur) set({ tempCombo: { ...cur, sauce } });
  },

  setComboDrink: (drink) => {
    const cur = get().tempCombo;
    if (cur) set({ tempCombo: { ...cur, drink } });
  },

  setComboExtra: (extra) => {
    const cur = get().tempCombo;
    if (cur) set({ tempCombo: { ...cur, extra } });
  },

  setComboStep: (step) => set({ comboStep: step }),

  finishComboBuilder: () => {
    const combo = get().tempCombo;
    if (!combo) return;

    // Obliczenie ceny zestawu
    // Zestaw bazowo kosztuje bazowy produkt + 12.80 zł, duży + 3.00 zł
    let price = combo.baseProduct.price + 12.80;
    if (combo.size === 'large') price += 3.00;
    if (combo.sauce.priceAdd) price += combo.sauce.priceAdd;
    if (combo.drink.priceAdd) price += combo.drink.priceAdd;
    if (combo.extra?.priceAdd) price += combo.extra.priceAdd;

    const cartItem: CartItem = {
      id: `ITEM_${Date.now()}`,
      isCombo: true,
      product: combo.baseProduct,
      quantity: 1,
      comboConfig: combo,
      calculatedUnitPrice: Math.round(price * 100) / 100,
    };

    eventLogger.logTouch(
      'AOI_cel',
      `Dodanie zestawu do koszyka: ${combo.baseProduct.name} (Zestaw ${combo.size})`,
      {} as MouseEvent,
      'combo-builder'
    );

    set((state) => ({
      cart: [...state.cart, cartItem],
      tempCombo: null,
      activeModal: 'product-added',
    }));
  },

  // Personalizacja (S2)
  openPersonalize: (product, cartItemId) => {
    // Kopia składników produktu lub domyślnych
    const initialIngredients = product.ingredients
      ? JSON.parse(JSON.stringify(product.ingredients))
      : [
          { id: 'beef', name: 'Mięso wołowe', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
          { id: 'cheese', name: 'Ser cheddar', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
          { id: 'pickles', name: 'Pikle', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
          { id: 'sauce', name: 'Sos burgerowy', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
          { id: 'lettuce', name: 'Sałata', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
        ];

    set({
      selectedProduct: product,
      selectedCartItemId: cartItemId || null,
      tempIngredients: initialIngredients,
      currentScreen: 'personalize',
      activeModal: 'none',
    });
  },

  updateIngredientQty: (ingredientId, delta) => {
    set((state) => ({
      tempIngredients: state.tempIngredients.map((ing) => {
        if (ing.id !== ingredientId) return ing;
        const newQty = Math.max(ing.minQuantity, Math.min(ing.maxQuantity, ing.quantity + delta));
        return { ...ing, quantity: newQty };
      }),
    }));
  },

  resetIngredients: () => {
    const prod = get().selectedProduct;
    if (prod && prod.ingredients) {
      set({ tempIngredients: JSON.parse(JSON.stringify(prod.ingredients)) });
    }
  },

  savePersonalization: () => {
    const { selectedCartItemId, selectedProduct, tempIngredients, cart } = get();

    if (selectedCartItemId) {
      // Edycja istniejącej pozycji w koszyku
      set({
        cart: cart.map((item) => {
          if (item.id !== selectedCartItemId) return item;
          return {
            ...item,
            customIngredients: [...tempIngredients],
          };
        }),
        currentScreen: 'cart',
      });
    } else if (selectedProduct) {
      // Dodanie nowo spersonalizowanego produktu
      const cartItem: CartItem = {
        id: `ITEM_${Date.now()}`,
        isCombo: false,
        product: selectedProduct,
        quantity: 1,
        customIngredients: [...tempIngredients],
        calculatedUnitPrice: selectedProduct.price,
      };
      set((state) => ({
        cart: [...state.cart, cartItem],
        activeModal: 'product-added',
      }));
    }

    eventLogger.logTouch('AOI_cel', 'Zapisano personalizację produktu', {} as MouseEvent, 'personalize');
  },

  // Koszyk i Zamówienie
  addProductToCart: (product, quantity = 1) => {
    const existing = get().cart.find((i) => !i.isCombo && i.product.id === product.id);

    if (existing) {
      set((state) => ({
        cart: state.cart.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
        ),
        activeModal: 'product-added',
      }));
    } else {
      const cartItem: CartItem = {
        id: `ITEM_${Date.now()}`,
        isCombo: false,
        product,
        quantity,
        calculatedUnitPrice: product.price,
      };
      set((state) => ({
        cart: [...state.cart, cartItem],
        activeModal: 'product-added',
      }));
    }

    eventLogger.logTouch('AOI_cel', `Dodano do koszyka: ${product.name}`, {} as MouseEvent, get().currentScreen);
  },

  updateCartQuantity: (itemId, delta) => {
    const item = get().cart.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      get().removeCartItem(itemId);
    } else {
      eventLogger.logTouch(
        'AOI_cel',
        `Zmiana ilości w koszyku (${item.product.name}): ${newQty}`,
        {} as MouseEvent,
        'cart'
      );
      set((state) => ({
        cart: state.cart.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
      }));
    }
  },

  removeCartItem: (itemId) => {
    const item = get().cart.find((i) => i.id === itemId);
    eventLogger.logTouch(
      'AOI_cel',
      `Usunięto z koszyka: ${item?.product.name}`,
      {} as MouseEvent,
      'cart'
    );
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== itemId),
    }));
  },

  getCartTotal: () => {
    const itemsTotal = get().cart.reduce((acc, item) => acc + item.calculatedUnitPrice * item.quantity, 0);
    return Math.round((itemsTotal + get().donationAdded) * 100) / 100;
  },

  getCartItemsCount: () => {
    return get().cart.reduce((acc, item) => acc + item.quantity, 0);
  },

  resetAll: () => {
    eventLogger.logTouch('AOI_wstecz', 'Reset aplikacji i koszyka', {} as MouseEvent, get().currentScreen);
    set({
      currentScreen: 'welcome',
      previousScreen: null,
      activeModal: 'none',
      cart: [],
      selectedProduct: null,
      tempCombo: null,
      tempIngredients: [],
      nipInput: '',
      donationAdded: 0,
      paymentTerminalStep: 1,
      isAccessibilityMode: false,
    });
  },

  // Płatność i NIP (S3)
  setNipInput: (nip) => set({ nipInput: nip }),

  appendNipDigit: (digit) => {
    if (get().nipInput.length < 10) {
      set((state) => ({ nipInput: state.nipInput + digit }));
    }
  },

  backspaceNip: () => {
    set((state) => ({ nipInput: state.nipInput.slice(0, -1) }));
  },

  clearNip: () => set({ nipInput: '' }),

  submitNip: () => {
    const nip = get().nipInput.trim();
    // Walidacja NIP (musi mieć dokładnie 10 cyfr)
    if (nip.length !== 10 || !/^\d{10}$/.test(nip)) {
      get().triggerError('Nieprawidłowy numer NIP! Upewnij się, że wprowadzono dokładnie 10 cyfr.', 'AOI_blad');
    } else {
      eventLogger.logTouch('AOI_cel', `Poprawny NIP: ${nip}`, {} as MouseEvent, 'nip-entry');
      set({ currentScreen: 'donation' });
    }
  },

  setDonation: (amount) => {
    eventLogger.logTouch(
      'AOI_cel',
      amount > 0 ? `Wybrano darowiznę: ${amount.toFixed(2)} zł` : 'Pominięto darowiznę',
      {} as MouseEvent,
      'donation'
    );
    set({ donationAdded: amount, currentScreen: 'payment-method' });
  },

  startCardPayment: () => {
    eventLogger.logTouch('AOI_cel', 'Wybrano płatność: Zapłać tutaj kartą lub BLIKIEM', {} as MouseEvent, 'payment-method');
    set({
      currentScreen: 'payment-processing',
      paymentTerminalStep: 1,
    });
  },

  advanceTerminalStep: (step) => {
    set({ paymentTerminalStep: step });
  },

  completePayment: () => {
    const randomOrder = Math.floor(Math.random() * 90) + 10;
    eventLogger.markCompleted();
    eventLogger.logTouch('AOI_cel', `Płatność zakończona sukcesem! Zamówienie #${randomOrder}`, {} as MouseEvent, 'payment-success');
    set({
      orderNumber: randomOrder,
      currentScreen: 'payment-success',
      cart: [],
      donationAdded: 0,
      nipInput: '',
    });
  },
}));
