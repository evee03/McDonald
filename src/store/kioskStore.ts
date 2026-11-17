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
  | 'dine-option-change'
  | 'error'
  | 'product-added'
  | 'upsell'
  | 'physical-terminal'
  | 'physical-scanner';

export type InterfaceVersion = 'A' | 'B';

export interface ConfiguredCombo {
  baseProduct: Product;
  size?: 'standard' | 'large';
  side?: 'frytki' | 'salatka';
  sauce?: ComboOption;
  drink?: ComboOption;
  extra?: ComboOption;
  customIngredients?: Ingredient[];
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

export type FontSizeLevel = 0 | 1 | 2; // 0=normal, 1=A+, 2=A++

interface KioskState {
  // Nawigacja
  currentScreen: ScreenId;
  previousScreen: ScreenId | null;
  activeCategory: string;
  isAccessibilityMode: boolean;
  fontSizeLevel: FontSizeLevel;
  interfaceVersion: InterfaceVersion;

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
  pendingComboQuantity: number;
  pendingProductIngredients: Ingredient[] | null;
  personalizeReturnModal: ModalType;

  // Konfigurator zestawu (Combo Builder)
  comboStep: number; // 1: Rozmiar, 2: Dodatek, 3: Sos, 4: Napój, 5: Extra, 6: Podsumowanie
  tempCombo: ConfiguredCombo | null;

  // Personalizacja składników
  tempIngredients: Ingredient[];

  // Koszyk
  cart: CartItem[];
  lastAddedItem: CartItem | null;

  // Płatność i faktura
  nipInput: string;
  donationAdded: number;
  orderNumber: number;
  paymentTerminalStep: 1 | 2 | 3 | 4; // 1: instrukcja, 2: połączenie, 3: zbliż kartę, 4: autoryzacja

  // Akcje
  navigateTo: (screen: ScreenId, aoi?: StandardAOI, label?: string) => void;
  goBack: (aoi?: StandardAOI) => void;
  toggleAccessibility: () => void;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  setInterfaceVersion: (version: InterfaceVersion) => void;
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
  setPendingComboQuantity: (quantity: number) => void;
  startComboBuilder: (product: Product, cartItemId?: string, quantity?: number) => void;
  setComboSize: (size: 'standard' | 'large') => void;
  setComboSide: (side: 'frytki' | 'salatka') => void;
  setComboSauce: (sauce: ComboOption) => void;
  setComboDrink: (drink: ComboOption) => void;
  setComboExtra: (extra?: ComboOption) => void;
  setComboStep: (step: number) => void;
  finishComboBuilder: (quantity?: number) => void;
  cancelComboBuilder: (removeProduct: boolean) => void;

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
  fontSizeLevel: 0,
  interfaceVersion: 'A',

  activeModal: 'none',
  errorMessage: '',
  errorAoiOrigin: 'AOI_blad',

  activeScenario: 'S1',
  participantId: 'P01',

  dineOption: null,
  currentLanguage: 'pl',

  selectedProduct: null,
  selectedCartItemId: null,
  pendingComboQuantity: 1,
  pendingProductIngredients: null,
  personalizeReturnModal: 'none',

  comboStep: 1,
  tempCombo: null,

  tempIngredients: [],

  cart: [],
  lastAddedItem: null,

  nipInput: '',
  donationAdded: 0,
  orderNumber: 42,
  paymentTerminalStep: 1,

  // Nawigacja
  navigateTo: (screen, _aoi = 'AOI_cel', _label = `Przejście do ${screen}`) => {
    const prev = get().currentScreen;
    set({ currentScreen: screen, previousScreen: prev });
  },

  goBack: (_aoi = 'AOI_wstecz') => {
    const { currentScreen, previousScreen, personalizeReturnModal, activeModal } = get();
    const prev = previousScreen || 'menu';
    set({
      currentScreen: prev,
      previousScreen: null,
      activeModal: currentScreen === 'personalize' ? personalizeReturnModal : activeModal,
      personalizeReturnModal: currentScreen === 'personalize' ? 'none' : personalizeReturnModal,
    });
  },

  toggleAccessibility: () => {
    const nextState = !get().isAccessibilityMode;
    set({ isAccessibilityMode: nextState });
  },

  setFontSizeLevel: (level) => set({ fontSizeLevel: level }),

  setInterfaceVersion: (version) => set({ interfaceVersion: version }),

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
  openModal: (modal, _metadata) => {
    set({ activeModal: modal });
  },

  closeModal: (_aoi = 'AOI_wstecz') => {
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
    set({ selectedProduct: product, activeModal: 'product-detail', pendingProductIngredients: null });
  },

  setPendingComboQuantity: (quantity) => {
    set({ pendingComboQuantity: Math.max(1, Math.min(9, Math.round(quantity))) });
  },

  startComboBuilder: (product, cartItemId, quantity = 1) => {
    const existingItem = cartItemId
      ? get().cart.find((item) => item.id === cartItemId)
      : undefined;
    const pendingIngredients = get().pendingProductIngredients;

    // Inicjalizacja domyślnego zestawu
    const initialCombo: ConfiguredCombo = existingItem?.comboConfig ?
    {
      ...existingItem.comboConfig,
      size: existingItem.comboConfig.size || 'standard',
      customIngredients: existingItem.customIngredients
        ? [...existingItem.customIngredients]
        : undefined,
    }
    :{
      baseProduct: product,
      size: 'standard',
      side: undefined,
      sauce: undefined,
      drink: undefined,
      extra: undefined,
      customIngredients: pendingIngredients
        ? [...pendingIngredients]
        : undefined,
    };

    set({
      selectedProduct: product,
      selectedCartItemId: cartItemId || null,
      pendingComboQuantity: Math.max(1, Math.min(9, Math.round(quantity))),
      tempCombo: initialCombo,
      comboStep: cartItemId ? 6 : 1,
      currentScreen: 'combo-builder',
      activeModal: 'none',
      pendingProductIngredients: null,
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

  cancelComboBuilder: (removeProduct) => {
    const { selectedCartItemId } = get();
    const returnScreen = selectedCartItemId ? 'cart' : 'menu';

    set((state) => ({
      cart: removeProduct && selectedCartItemId
        ? state.cart.filter((item) => item.id !== selectedCartItemId)
        : state.cart,
      selectedProduct: null,
      selectedCartItemId: null,
      tempCombo: null,
      currentScreen: returnScreen,
      previousScreen: 'combo-builder',
      activeModal: 'none',
    }));
  },

  finishComboBuilder: (quantity = 1) => {
    const { tempCombo, selectedCartItemId } = get();
    if (!tempCombo) return;
    const size = tempCombo.size || 'standard';
    if (!tempCombo.side || !tempCombo.sauce || !tempCombo.drink || !tempCombo.extra) return;
    const normalizedQuantity = Math.max(1, Math.min(9, Math.round(quantity)));

    // Obliczenie ceny zestawu
    // Zestaw bazowo kosztuje bazowy produkt + 12.80 zł, duży + 3.00 zł
    let price = tempCombo.baseProduct.price + 12.80;
    if (size === 'large') price += 3.00;
    if (tempCombo.sauce.priceAdd) price += tempCombo.sauce.priceAdd;
    if (tempCombo.drink.priceAdd) price += tempCombo.drink.priceAdd;
    if (tempCombo.extra?.priceAdd) price += tempCombo.extra.priceAdd;

    const calculatedUnitPrice = Math.round(price * 100) / 100;

    const completedCombo: ConfiguredCombo = {
      ...tempCombo,
      size,
    };

    if (selectedCartItemId) {
      // Aktualizacja istniejącego zestawu
      set((state) => ({
        cart: state.cart.map((item) =>
          item.id === selectedCartItemId
            ? {
                ...item,
                product: completedCombo.baseProduct,
                comboConfig: completedCombo,
                customIngredients: completedCombo.customIngredients
                  ? [...completedCombo.customIngredients]
                  : item.customIngredients,
                quantity: normalizedQuantity,
                calculatedUnitPrice,
              }
            : item
        ),
        tempCombo: null,
        selectedCartItemId: null,
        currentScreen: 'cart',
        activeModal: 'none',
      }));
    } else {
      // Dodanie nowego zestawu
      const cartItem: CartItem = {
        id: `ITEM_${Date.now()}`,
        isCombo: true,
        product: completedCombo.baseProduct,
        quantity: normalizedQuantity,
        comboConfig: completedCombo,
        customIngredients: completedCombo.customIngredients
          ? [...completedCombo.customIngredients]
          : undefined,
        calculatedUnitPrice,
      };

      set((state) => ({
        cart: [...state.cart, cartItem],
        lastAddedItem: cartItem,
        tempCombo: null,
        selectedCartItemId: null,
        currentScreen: 'menu',
        activeModal: 'product-added',
      }));
    }
  },

  // Personalizacja (S2)
  openPersonalize: (product, cartItemId) => {
    const state = get();

    const existingCartItem = cartItemId
      ? state.cart.find((item) => item.id === cartItemId)
      : undefined;

    const existingComboIngredients = state.tempCombo?.customIngredients;

    const savedIngredients =
      existingCartItem?.customIngredients || existingComboIngredients;

    const initialIngredients = savedIngredients
      ? JSON.parse(JSON.stringify(savedIngredients))
      : product.ingredients
        ? JSON.parse(JSON.stringify(product.ingredients))
        : [
            { id: 'beef', name: 'Mięso wołowe', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
            { id: 'cheese', name: 'Ser cheddar', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
            { id: 'pickles', name: 'Pikle', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
            { id: 'sauce', name: 'Sos burgerowy', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
            { id: 'lettuce', name: 'Sałata', image: 'category', quantity: 1, maxQuantity: 2, minQuantity: 0 },
          ];

    set((state) => ({
      selectedProduct: product,
      selectedCartItemId: cartItemId || null,
      tempIngredients: initialIngredients,
      previousScreen: state.currentScreen,
      currentScreen: 'personalize',
      activeModal: 'none',
      personalizeReturnModal: !cartItemId && state.currentScreen === 'menu' ? 'product-detail' : 'none',
    }));
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
    const { selectedCartItemId, selectedProduct, tempIngredients, cart, previousScreen, tempCombo } = get();

    // Personalizacja burgera podczas konfiguracji zestawu
    if (tempCombo) {
      set({
        tempCombo: {
          ...tempCombo,
          customIngredients: [...tempIngredients],
        },
        currentScreen: 'combo-builder',
        previousScreen: 'personalize',
        personalizeReturnModal: 'none',
      });
      return;
    }

    if (selectedCartItemId) {
      // Edycja burgera w istniejącym zestawie lub produktu w koszyku
      set({
        cart: cart.map((item) =>
          item.id === selectedCartItemId
            ? { ...item, customIngredients: [...tempIngredients] }
            : item
        ),
        currentScreen: 'cart',
        previousScreen: 'personalize',
        selectedCartItemId: null,
        personalizeReturnModal: 'none',
      });
    } else if (selectedProduct) {
      // Zachowaj personalizację i wróć do szczegółów produktu przed dodaniem.
      set({
        currentScreen: previousScreen || 'menu',
        previousScreen: 'personalize',
        activeModal: 'product-detail',
        pendingProductIngredients: [...tempIngredients],
        personalizeReturnModal: 'none',
      });
    }

  },

  // Koszyk i Zamówienie
  addProductToCart: (product, quantity = 1) => {
    const pendingIngredients = get().pendingProductIngredients;
    const existing = get().cart.find((i) => !i.isCombo && i.product.id === product.id);

    if (existing) {
      const updatedAddition: CartItem = {
        ...existing,
        quantity,
        customIngredients: pendingIngredients ? [...pendingIngredients] : existing.customIngredients,
      };
      set((state) => ({
        cart: state.cart.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                customIngredients: pendingIngredients ? [...pendingIngredients] : item.customIngredients,
              }
            : item
        ),
        lastAddedItem: updatedAddition,
        activeModal: 'product-added',
        pendingProductIngredients: null,
      }));
    } else {
      const cartItem: CartItem = {
        id: `ITEM_${Date.now()}`,
        isCombo: false,
        product,
        quantity,
        customIngredients: pendingIngredients ? [...pendingIngredients] : undefined,
        calculatedUnitPrice: product.price,
      };
      set((state) => ({
        cart: [...state.cart, cartItem],
        lastAddedItem: cartItem,
        activeModal: 'product-added',
        pendingProductIngredients: null,
      }));
    }

  },

  updateCartQuantity: (itemId, delta) => {
    const item = get().cart.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(1,item.quantity + delta);
    if (newQty !== item.quantity) {
      set((state) => ({
        cart: state.cart.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
      }));
    }
  },

  removeCartItem: (itemId) => {
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
    eventLogger.resetTask();
    set({
      currentScreen: 'welcome',
      previousScreen: null,
      activeModal: 'none',
      cart: [],
      lastAddedItem: null,
      selectedProduct: null,
      pendingProductIngredients: null,
      personalizeReturnModal: 'none',
      tempCombo: null,
      tempIngredients: [],
      nipInput: '',
      donationAdded: 0,
      paymentTerminalStep: 1,
      isAccessibilityMode: false,
      fontSizeLevel: 0,
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
      set({ currentScreen: 'donation' });
    }
  },

  setDonation: (amount) => {
    set({ donationAdded: amount, currentScreen: 'payment-method' });
  },

  startCardPayment: () => {
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
    set({
      orderNumber: randomOrder,
      currentScreen: 'payment-success',
      cart: [],
      lastAddedItem: null,
      donationAdded: 0,
      nipInput: '',
    });
  },
}));
