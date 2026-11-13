import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const CartScreen: React.FC = () => {
  const t = useT();
  const {
    cart,
    getCartTotal,
    updateCartQuantity,
    removeCartItem,
    navigateTo,
    openPersonalize,
  } = useKioskStore();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const total = getCartTotal();

  const toggleDetails = (itemId: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Przełączenie szczegółów pozycji ${itemId}`, e, 'cart');
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleEditMeal = (item: typeof cart[0], e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Edytuj posiłek: ${item.product.name}`, e, 'cart');
    openPersonalize(item.product, item.id);
  };

  const handleAddMoreProducts = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Kliknięcie: Dodaj produkty (powrót do menu)', e, 'cart');
    navigateTo('menu', 'AOI_wstecz', 'Powrót do menu produktów');
  };

  const handleCheckoutOrder = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Złożenie zamówienia (Suma: ${total.toFixed(2)} zł)`, e, 'cart', {
      total,
      itemsCount: cart.length,
    });
    navigateTo('payment-method', 'AOI_cel', 'Przejście do wyboru płatności');
  };

  return (
    <div className="kiosk-page-view cart-page">
      {/* Nagłówek koszyka */}
      <header className="cart-top-header">
        <div className="cart-header-left">
          <span className="cart-brand-m">M</span>
          <h1 className="cart-header-title">{t('Twoje zamówienie')}</h1>
        </div>
      </header>

      {/* Lista zamówionych produktów */}
      <main className="cart-items-scroll-list">
        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <span className="empty-icon"><VisualIcon kind="bag" label="Papierowa torba na wynos" photoKey="takeaway-bag" /></span>
            <p className="empty-title">{t('Twój koszyk jest pusty')}</p>
            <button
              type="button"
              className="btn-empty-return"
              onClick={handleAddMoreProducts}
              data-aoi="AOI_cel"
            >
              {t('Wróć do menu i dodaj produkty')}
            </button>
          </div>
        ) : (
          cart.map((item) => {
            const isExpanded = !!expandedItems[item.id];
            const itemTotal = item.calculatedUnitPrice * item.quantity;

            return (
              <div key={item.id} className="cart-item-card-row">
                <div className="cart-item-main-bar">
                  <div className="cart-item-visual"><VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} /></div>

                  <div className="cart-item-details-column">
                    <h2 className="cart-item-name-heading">
                      {t(item.product.name)} {item.isCombo ? `(${t('Zestaw')} ${item.comboConfig?.size === 'large' ? t('Powiększony') : t('Standardowy')})` : ''}
                    </h2>

                    {item.isCombo && (
                      <button
                        type="button"
                        className="btn-toggle-details"
                        onClick={(e) => toggleDetails(item.id, e)}
                        data-aoi="AOI_cel"
                      >
                        {isExpanded ? `${t('Ukryj szczegóły')} ▲` : `${t('Pokaż szczegóły')} ▼`}
                      </button>
                    )}

                    {/* Składniki zmodyfikowane w S2 */}
                    {item.customIngredients && item.customIngredients.length > 0 && (
                      <div className="cart-item-custom-note">
                        {t('Personalizacja')}: {item.customIngredients.filter((i) => i.quantity !== 1).map((i) => `${t(i.name)}: ${i.quantity}`).join(', ') || t('Standardowy')}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-controls-column">
                    <div className="cart-qty-picker">
                      <button
                        type="button"
                        className="btn-cart-qty-minus"
                        onClick={(e) => {
                          eventLogger.logTouch('AOI_cel', 'Zmniejsz ilość pozycji w koszyku', e, 'cart');
                          updateCartQuantity(item.id, -1);
                        }}
                        data-aoi="AOI_cel"
                      >
                        —
                      </button>
                      <span className="cart-qty-number">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn-cart-qty-plus"
                        onClick={(e) => {
                          eventLogger.logTouch('AOI_cel', 'Zwiększ ilość pozycji w koszyku', e, 'cart');
                          updateCartQuantity(item.id, 1);
                        }}
                        data-aoi="AOI_cel"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-cart-item-remove"
                      onClick={(e) => {
                        eventLogger.logTouch('AOI_cel', `Usuń pozycję z koszyka: ${item.product.name}`, e, 'cart');
                        removeCartItem(item.id);
                      }}
                      data-aoi="AOI_cel"
                    >
                      {t('Usuń')}
                    </button>

                    <div className="cart-item-price-sum">{itemTotal.toFixed(2)} zł</div>
                  </div>
                </div>

                {/* Rozwinięty widok zestawu z przyciskiem "Edytuj posiłek" (S2) */}
                {item.isCombo && isExpanded && item.comboConfig && (
                  <div className="cart-combo-expanded-drawer">
                    <div className="combo-elements-preview-grid">
                      <div className="preview-sub-box">
                        <span className="preview-icon"><VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} /></span>
                        <span className="preview-label">{t(item.product.name)}</span>
                      </div>
                      <div className="preview-sub-box">
                        <span className="preview-icon"><VisualIcon kind="fries" label={item.comboConfig.side} /></span>
                        <span className="preview-label">{t(item.comboConfig.side === 'frytki' ? 'Frytki i Dodatki' : 'Sałatka')}</span>
                      </div>
                      <div className="preview-sub-box">
                        <span className="preview-icon"><VisualIcon kind={item.comboConfig.sauce.image} label={item.comboConfig.sauce.name} /></span>
                        <span className="preview-label">{t(item.comboConfig.sauce.name)}</span>
                      </div>
                      <div className="preview-sub-box">
                        <span className="preview-icon"><VisualIcon kind={item.comboConfig.drink.image} label={item.comboConfig.drink.name} photoKey={item.comboConfig.drink.id} /></span>
                        <span className="preview-label">{t(item.comboConfig.drink.name)}</span>
                      </div>
                      {item.comboConfig.extra && (
                        <div className="preview-sub-box">
                          <span className="preview-icon"><VisualIcon kind={item.comboConfig.extra.image} label={item.comboConfig.extra.name} /></span>
                          <span className="preview-label">{t(item.comboConfig.extra.name)}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-edit-meal-action"
                      onClick={(e) => handleEditMeal(item, e)}
                      data-aoi="AOI_cel"
                    >
                      {t('Edytuj posiłek (modyfikacja składników)')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Podsumowanie kwoty i przyciski zamówienia */}
      {cart.length > 0 && (
        <div className="cart-bottom-checkout-panel">
          <div className="cart-total-display-row">
            <span className="total-label-text">{t('Suma')}</span>
            <span className="total-value-big">{total.toFixed(2)} zł</span>
          </div>

          <div className="cart-main-action-buttons">
            <button
              type="button"
              className="btn-cart-add-more"
              onClick={handleAddMoreProducts}
              data-aoi="AOI_wstecz"
            >
              {t('Dodaj produkty')}
            </button>

            <button
              type="button"
              className="btn-cart-submit-order"
              onClick={handleCheckoutOrder}
              data-aoi="AOI_cel"
            >
              {t('Złóż zamówienie')}
            </button>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
};
