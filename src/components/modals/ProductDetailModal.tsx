import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const ProductDetailModal: React.FC = () => {
  const t = useT();
  const {
    activeModal,
    selectedProduct,
    closeModal,
    openModal,
    openPersonalize,
    addProductToCart,
    currentScreen,
  } = useKioskStore();

  const [quantity, setQuantity] = useState(1);

  if (activeModal !== 'product-detail' || !selectedProduct) return null;

  const handleClose = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Zamknij szczegóły produktu (X)', e, currentScreen);
    closeModal('AOI_wstecz');
  };

  const handlePersonalize = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Personalizuj produkt: ${selectedProduct.name}`, e, currentScreen);
    openPersonalize(selectedProduct);
  };

  const handleNutritionClick = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Podgląd wartości odżywczych i składników', e, currentScreen);
    openModal('none');
    useKioskStore.getState().navigateTo('allergens', 'AOI_cel', 'Wartości odżywcze');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Dodaj produkt: ${selectedProduct.name} (x${quantity})`, e, currentScreen);

    if (selectedProduct.canBeCombo) {
      // Wyświetl prompt: Czy zestaw?
      openModal('none');
      useKioskStore.getState().navigateTo('combo-prompt', 'AOI_cel', 'A może zestaw?');
    } else {
      addProductToCart(selectedProduct, quantity);
    }
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleClose}>
      <div
        className="kiosk-product-detail-card"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <button
          type="button"
          className="modal-close-x-btn"
          onClick={handleClose}
          data-aoi="AOI_wstecz"
        >
          ✕
        </button>

        <div className="detail-product-visual">
          <span className="product-visual-emoji"><VisualIcon kind={selectedProduct.image} label={selectedProduct.name} photoKey={selectedProduct.id} /></span>
        </div>

        <h2 className="detail-product-name">{t(selectedProduct.name)}</h2>
        <div className="detail-product-price">
          {(selectedProduct.price * quantity).toFixed(2)} zł
        </div>

        <button
          type="button"
          className="btn-nutrition-info"
          onClick={handleNutritionClick}
          data-aoi="AOI_cel"
        >
          {t('Wartości odżywcze i składniki')}
        </button>

        {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
          <button
            type="button"
            className="btn-open-personalize"
            onClick={handlePersonalize}
            data-aoi="AOI_cel"
          >
            {t('Personalizuj')}
          </button>
        )}

        <div className="detail-quantity-bar">
          <button
            type="button"
            className="qty-btn"
            onClick={(e) => {
              eventLogger.logTouch('AOI_cel', 'Zmniejsz ilość [-]', e, currentScreen);
              setQuantity((q) => Math.max(1, q - 1));
            }}
            data-aoi="AOI_cel"
          >
            —
          </button>
          <span className="qty-number">{quantity}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={(e) => {
              eventLogger.logTouch('AOI_cel', 'Zwiększ ilość [+]', e, currentScreen);
              setQuantity((q) => q + 1);
            }}
            data-aoi="AOI_cel"
          >
            +
          </button>
        </div>

        <div className="detail-footer-actions">
          <button
            type="button"
            className="btn-detail-cancel"
            onClick={handleClose}
            data-aoi="AOI_wstecz"
          >
            {t('Anuluj')}
          </button>

          <button
            type="button"
            className="btn-detail-add"
            onClick={handleAddToCart}
            data-aoi="AOI_cel"
          >
            {t('Dodaj do zamówienia')}
          </button>
        </div>
      </div>
    </div>
  );
};
