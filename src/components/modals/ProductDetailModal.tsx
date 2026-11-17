import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import { eventLogger } from '../../logger/eventLogger';
import { useKioskStore } from '../../store/kioskStore';
import { formatPrice } from '../../utils/formatPrice';
import { IngredientIcon } from '../common/IngredientIcon';
import { VisualIcon } from '../common/VisualIcon';

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
    activeCategory,
    startComboBuilder,
    setPendingComboQuantity,
    interfaceVersion,
  } = useKioskStore();

  const isVersionB = interfaceVersion === 'B';

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedProduct?.id]);

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
      openModal('none');
      if (activeCategory === 'zestawy') {
        eventLogger.logTouch('AOI_cel', `Rozpoczęcie konfiguracji zestawu: ${selectedProduct.name}`, e, currentScreen);
        startComboBuilder(selectedProduct, undefined, quantity);
      } else {
        // Poza kategorią zestawów zapytaj, czy produkt ma być zestawem.
        setPendingComboQuantity(quantity);
        useKioskStore.getState().navigateTo('combo-prompt', 'AOI_cel', 'A może zestaw?');
      }
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
          <span className="product-visual-emoji">
            {selectedProduct.id.startsWith('sauce-')
              ? <IngredientIcon id={selectedProduct.id} label={selectedProduct.name} />
              : <VisualIcon kind={selectedProduct.image} label={selectedProduct.name} photoKey={selectedProduct.id} />}
          </span>
        </div>

        <h2 className="detail-product-name">{t(selectedProduct.name)}</h2>
        <div className="detail-product-price">
          {formatPrice(selectedProduct.price * quantity)} zł
        </div>

        {isVersionB ? (
          <>
            <button
              type="button"
              className="btn-nutrition-info"
              onClick={handleNutritionClick}
              data-aoi="AOI_cel"
            >
              {t('Wartości odżywcze i składniki')}
            </button>

            {/* Ważniejsza personalizacja — w sekcji konfiguracji produktu */}
            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
              <button
                type="button"
                className="btn-open-personalize"
                onClick={handlePersonalize}
                data-aoi="AOI_cel"
              >
                <span className="btn-personalize-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span>{t('Personalizuj')}</span>
              </button>
            )}

            {/* Wybór ilości ze stepperem */}
            <div className="detail-quantity-bar">
              <button
                type="button"
                className="qty-btn qty-btn-minus"
                disabled={quantity <= 1}
                onClick={(e) => {
                  eventLogger.logTouch('AOI_cel', 'Zmniejsz ilość [-]', e, currentScreen);
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                data-aoi="AOI_cel"
                aria-label={t('Zmniejsz ilość')}
                title={t('Zmniejsz ilość')}
              >
                <span className="qty-symbol" aria-hidden="true">—</span>
                <span className="qty-text-label">{t('Zmniejsz')}</span>
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                className="qty-btn qty-btn-plus"
                onClick={(e) => {
                  eventLogger.logTouch('AOI_cel', 'Zwiększ ilość [+]', e, currentScreen);
                  setQuantity((q) => q + 1);
                }}
                data-aoi="AOI_cel"
                aria-label={t('Zwiększ ilość')}
                title={t('Zwiększ ilość')}
              >
                <span className="qty-symbol" aria-hidden="true">+</span>
                <span className="qty-text-label">{t('Zwiększ')}</span>
              </button>
            </div>

            {/* Najważniejsza akcja: Dodaj do zamówienia oraz Anuluj */}
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
          </>
        ) : (
          <>
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
                disabled={quantity <= 1}
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
          </>
        )}
      </div>
    </div>
  );
};
