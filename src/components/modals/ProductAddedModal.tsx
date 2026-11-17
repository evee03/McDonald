import React from 'react';
import { useT } from '../../i18n';
import { eventLogger } from '../../logger/eventLogger';
import { useKioskStore } from '../../store/kioskStore';
import { formatPrice } from '../../utils/formatPrice';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { getComboProductLabel } from '../../data/products';

export const ProductAddedModal: React.FC = () => {
  const t = useT();
  const {
    activeModal,
    closeModal,
    getCartTotal,
    getCartItemsCount,
    currentScreen,
    navigateTo,
    interfaceVersion,
    lastAddedItem,
    cart,
  } = useKioskStore();

  const total = getCartTotal();
  const count = getCartItemsCount();
  const isPaymentFlow = currentScreen === 'cart';
  const isVersionB = interfaceVersion === 'B';

  if (activeModal !== 'product-added') return null;

  const addedItem = lastAddedItem || (cart.length > 0 ? cart[cart.length - 1] : null);

  const handleContinue = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Potwierdzenie dodania produktu', e, currentScreen);
    closeModal('AOI_cel');
    navigateTo(
      isPaymentFlow ? 'payment-method' : 'menu',
      'AOI_cel',
      isPaymentFlow ? 'Przejście do wyboru płatności' : 'Powrót do menu po dodaniu produktu.'
    );
  };

  const handleGoToSummary = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Przejście do podsumowania zamówienia', e, currentScreen);
    closeModal('AOI_cel');
    navigateTo(
      isPaymentFlow ? 'payment-method' : 'cart',
      'AOI_cel',
      isPaymentFlow ? 'Przejście do wyboru płatności' : 'Przejście do podsumowania zamówienia'
    );
  };

  // Wersja A: Dokładnie zachowany dotychczasowy wygląd
  if (!isVersionB) {
    return (
      <div className="kiosk-modal-backdrop" onClick={handleContinue}>
        <div
          className="kiosk-product-added-box animated-pop"
          onClick={(e) => e.stopPropagation()}
          data-aoi="AOI_cel"
        >
          <div className="added-icon-bag">
            <span className="bag-symbol"><VisualIcon kind="bag" label="Produkt dodany" /></span>
            <span className="green-check-badge">✓</span>
          </div>

          <h2 className="added-title">{t('Produkt dodany do zamówienia')}</h2>
          <p className="added-subtitle">{t('Łączna kwota została zaktualizowana')}</p>

          <div className="added-total-amount">{formatPrice(total)} zł</div>

          <div className="added-modal-actions">
            {isPaymentFlow ? (
              <button type="button" className="btn-added-summary" onClick={handleContinue} data-aoi="AOI_cel">
                Przejdź do płatności
              </button>
            ) : (
              <>
                <button type="button" className="btn-added-continue" onClick={handleContinue} data-aoi="AOI_cel">
                  {t('Dalej')}
                </button>
                <button type="button" className="btn-added-summary" onClick={handleGoToSummary} data-aoi="AOI_cel">
                  {t('Przejdź do podsumowania')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wersja B: Nowoczesna karta dodanej pozycji z ikonami SVG elementów i czytelnym podsumowaniem
  const itemTitle = addedItem
    ? addedItem.isCombo
      ? getComboProductLabel(addedItem.product.name)
      : addedItem.product.name
    : '';

  const itemPrice = addedItem ? addedItem.calculatedUnitPrice * addedItem.quantity : 0;
  const isCombo = Boolean(addedItem?.isCombo && addedItem?.comboConfig);
  const comboConfig = addedItem?.comboConfig;

  const isPersonalized = Boolean(
    addedItem?.customIngredients &&
    addedItem.customIngredients.some((ing) => {
      const defaultQty = addedItem.product.ingredients?.find((d) => d.id === ing.id)?.quantity ?? 1;
      return ing.quantity !== defaultQty;
    })
  );

  return (
    <div className="kiosk-modal-backdrop" onClick={handleContinue}>
      <div
        className="kiosk-product-added-box product-added-box-b animated-pop"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        {/* Górna ikona sukcesu z ptaszkiem SVG */}
        <div className="added-header-status-b">
          <div className="added-check-circle-b" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="added-heading-b">{t('Dodano do zamówienia')}</h2>
        </div>

        {/* Karta dodanego produktu / zestawu */}
        {addedItem && (
          <div className="added-product-card-b">
            <div className="added-card-top-row-b">
              <div className="added-card-name-qty">
                <span className="added-card-qty-badge">{addedItem.quantity}×</span>
                <span className="added-card-product-name">{t(itemTitle)}</span>
                {isPersonalized && (
                  <span className="added-card-mod-pill">{t('Zmodyfikowano')}</span>
                )}
              </div>
              <span className="added-card-item-price">+{formatPrice(itemPrice)} zł</span>
            </div>

            {/* Elementy zestawu z ikonami SVG */}
            {isCombo && comboConfig && (
              <div className="added-combo-elements-grid-b" aria-label={t('Elementy zestawu')}>
                {/* 1. Burger */}
                <div className="added-element-chip-b">
                  <div className="added-chip-icon">
                    <VisualIcon kind={addedItem.product.image} label={addedItem.product.name} photoKey={addedItem.product.id} />
                  </div>
                  <span className="added-chip-label">{t(addedItem.product.name)}</span>
                </div>

                {/* 2. Dodatek */}
                <div className="added-element-chip-b">
                  <div className="added-chip-icon">
                    {comboConfig.side === 'frytki'
                      ? <VisualIcon kind="fries" label="Frytki" />
                      : <IngredientIcon id="salad" label="Sałatka" />}
                  </div>
                  <span className="added-chip-label">
                    {comboConfig.side === 'frytki' ? t('Frytki') : t('Sałatka')}
                  </span>
                </div>

                {/* 3. Sos */}
                {comboConfig.sauce && (
                  <div className="added-element-chip-b">
                    <div className="added-chip-icon">
                      <IngredientIcon id={comboConfig.sauce.id} label={comboConfig.sauce.name} />
                    </div>
                    <span className="added-chip-label">{t(comboConfig.sauce.name)}</span>
                  </div>
                )}

                {/* 4. Napój */}
                {comboConfig.drink && (
                  <div className="added-element-chip-b">
                    <div className="added-chip-icon">
                      <VisualIcon kind={comboConfig.drink.image} label={comboConfig.drink.name} photoKey={comboConfig.drink.id} />
                    </div>
                    <span className="added-chip-label">{t(comboConfig.drink.name)}</span>
                  </div>
                )}

                {/* 5. Ekstra deser (jeśli wybrano) */}
                {comboConfig.extra && comboConfig.extra.id !== 'no-thanks' && (
                  <div className="added-element-chip-b">
                    <div className="added-chip-icon">
                      <VisualIcon kind="category" label={comboConfig.extra.name} />
                    </div>
                    <span className="added-chip-label">{t(comboConfig.extra.name)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Pojedynczy produkt (nie zestaw) */}
            {!isCombo && (
              <div className="added-single-element-row-b">
                <div className="added-single-visual">
                  <VisualIcon kind={addedItem.product.image} label={addedItem.product.name} photoKey={addedItem.product.id} />
                </div>
                {addedItem.product.description && (
                  <div className="added-single-info">
                    <span className="added-single-desc">
                      {t(addedItem.product.description)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Belka łącznej kwoty w koszyku */}
        <div className="added-cart-total-bar-b">
          <div className="added-total-label-b">
            <span>{t('Razem w koszyku')}</span>
            <span className="added-total-count-b">({count} {count === 1 ? t('pozycja') : count < 5 ? t('pozycje') : t('pozycji')})</span>
          </div>
          <span className="added-total-price-b">{formatPrice(total)} zł</span>
        </div>

        {/* Przyciski akcji modala */}
        <div className="added-actions-b">
          {isPaymentFlow ? (
            <button type="button" className="btn-added-primary-b" onClick={handleContinue} data-aoi="AOI_cel">
              {t('Przejdź do płatności')}
            </button>
          ) : (
            <>
              <button type="button" className="btn-added-secondary-b" onClick={handleContinue} data-aoi="AOI_cel">
                {t('Wróć')}
              </button>
              <button type="button" className="btn-added-primary-b" onClick={handleGoToSummary} data-aoi="AOI_cel">
                <span>{t('Do koszyka')}</span>
                <span className="btn-cart-badge">{count}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
