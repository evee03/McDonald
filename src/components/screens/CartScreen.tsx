import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { useT } from '../../i18n';
import { formatPrice } from '../../utils/formatPrice';
import { getDisplayedIngredients } from '../../utils/productIngredients';
import { AllergensScrollbar } from '../common/AllergensScrollbar';
import { DineOptionButton } from '../common/DineOptionButton';
import { getComboProductLabel } from '../../data/products';
import type { CartItem } from '../../store/kioskStore';

export const CartScreen: React.FC = () => {
  const t = useT();
  const {
    cart,
    getCartTotal,
    updateCartQuantity,
    removeCartItem,
    navigateTo,
    openModal,
    openPersonalize,
    startComboBuilder,
    interfaceVersion,
  } = useKioskStore();

  const isVersionB = interfaceVersion === 'B';
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  const total = getCartTotal();

  const toggleDetails = (itemId: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Przełączenie szczegółów pozycji ${itemId}`, e, 'cart');
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleEditMeal = (item: typeof cart[0], e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Edytuj posiłek: ${item.product.name}`, e, 'cart');
    if (item.isCombo && item.comboConfig) {
      startComboBuilder(item.product, item.id);
    } else {
      openPersonalize(item.product, item.id);
    }
  };

  const handleAddMoreProducts = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Kliknięcie: Dodaj produkty (powrót do menu)', e, 'cart');
    navigateTo('menu', 'AOI_wstecz', 'Powrót do menu produktów');
  };

  const handleCheckoutOrder = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Złożenie zamówienia (Suma: ${formatPrice(total)} zł)`, e, 'cart', {
      total,
      itemsCount: cart.length,
    });
    openModal('upsell');
  };

  return (
    <div className="kiosk-page-view cart-page">
      {/* Nagłówek koszyka */}
      <header className="cart-top-header">
        <div className="cart-header-left">
          <span className="cart-brand-m">M</span>
          <h1 className="cart-header-title">{t('Twoje zamówienie')}</h1>
        </div>
        <DineOptionButton sourceScreen="cart" />
      </header>

      {/* Lista zamówionych produktów */}
      <AllergensScrollbar
        className="cart-scroll-shell"
        contentClassName="cart-items-scroll-list"
        contentElement="div"
      >
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
            const displayedIngredients = getDisplayedIngredients(item.product, item.customIngredients);
            const hasDetails = item.isCombo || displayedIngredients.length > 0;
            const canEdit = item.isCombo || Boolean(item.product.ingredients?.length || item.customIngredients?.length);

            if (isVersionB) {
              return (
                <div key={item.id} className="cart-item-card-row cart-item-card-row-b">
                  {/* Górny wiersz pozycji: Obrazek + Dane produktu + Cena */}
                  <div className="cart-b-item-top">
                    <div className="cart-item-visual">
                      {item.product.id.startsWith('sauce-')
                        ? <IngredientIcon id={item.product.id} label={item.product.name} />
                        : <VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} />}
                    </div>

                    <div className="cart-b-item-info">
                      <div className="cart-b-item-title-row">
                        <h2 className="cart-item-name-heading">
                          <span className="cart-item-title-text">{t(item.product.name)}</span>
                          {item.isCombo && (
                            <span className="cart-b-combo-badge">
                              {t('Zestaw')} {item.comboConfig?.size === 'large' ? t('Powiększony') : t('Standardowy')}
                            </span>
                          )}
                        </h2>
                        <div className="cart-item-price-sum">{formatPrice(itemTotal)} zł</div>
                      </div>

                      {/* Notatka o personalizacji składników */}
                      {item.customIngredients && item.customIngredients.length > 0 && (
                        <div className="cart-item-custom-note">
                          <span className="custom-note-tag">{t('Personalizacja')}:</span>{' '}
                          {item.customIngredients.filter((i) => i.quantity !== 1).map((i) => `${t(i.name)}: ${i.quantity}`).join(', ') || t('Standardowy')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dolny wiersz: Stepper ilości (lewa) + Przyciski akcji (prawa) */}
                  <div className="cart-b-item-bottom">
                    <div className="cart-qty-picker">
                      <button
                        type="button"
                        className="btn-cart-qty-minus"
                        disabled={item.quantity <= 1}
                        onClick={(e) => {
                          eventLogger.logTouch('AOI_cel', 'Zmniejsz ilość pozycji w koszyku', e, 'cart');
                          updateCartQuantity(item.id, -1);
                        }}
                        data-aoi="AOI_cel"
                        aria-label={t('Zmniejsz ilość')}
                        title={t('Zmniejsz ilość')}
                      >
                        <span className="qty-symbol" aria-hidden="true">—</span>
                        <span className="qty-text-label">{t('Zmniejsz')}</span>
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
                        aria-label={t('Zwiększ ilość')}
                        title={t('Zwiększ ilość')}
                      >
                        <span className="qty-symbol" aria-hidden="true">+</span>
                        <span className="qty-text-label">{t('Zwiększ')}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-cart-item-remove"
                      onClick={(e) => {
                        eventLogger.logTouch('AOI_cel', `Usuń pozycję z koszyka: ${item.product.name}`, e, 'cart');
                        setItemToDelete(item);
                      }}
                      data-aoi="AOI_cel"
                      title={t('Usuń pozycję')}
                    >
                      <span className="btn-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </span>
                      <span>{t('Usuń')}</span>
                    </button>
                  </div>

                  {/* Osobny wiersz na szczegóły pod spodem */}
                  {hasDetails && (
                    <div className="cart-b-details-toggle-row">
                      <button
                        type="button"
                        className="btn-toggle-details"
                        onClick={(e) => toggleDetails(item.id, e)}
                        data-aoi="AOI_cel"
                      >
                        <span className="btn-icon" aria-hidden="true">
                          {isExpanded ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          )}
                        </span>
                        <span>{isExpanded ? t('Ukryj szczegóły') : t('Pokaż szczegóły')}</span>
                      </button>
                    </div>
                  )}

                  {/* Rozwinięty widok składników produktu lub zestawu */}
                  {hasDetails && isExpanded && (
                    <div className="cart-combo-expanded-drawer">
                      {item.isCombo && item.comboConfig ? (
                        <div className="combo-elements-preview-grid">
                          <div className="preview-sub-box">
                            <span className="preview-icon">
                              {item.product.id.startsWith('sauce-')
                                ? <IngredientIcon id={item.product.id} label={item.product.name} />
                                : <VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} />}
                            </span>
                            <span className="preview-label">{t(item.product.name)}</span>
                          </div>
                          <div className="preview-sub-box">
                            <span className="preview-icon">
                              {item.comboConfig.side === 'frytki'
                                ? <VisualIcon kind="fries" label="Frytki" />
                                : item.comboConfig.side === 'salatka'
                                  ? <IngredientIcon id="salad" label="Sałatka" />
                                  : <span>—</span>}
                            </span>
                            <span className="preview-label">
                              {item.comboConfig.side
                                ? t(item.comboConfig.side === 'frytki' ? 'Frytki' : 'Sałatka')
                                : t('Nie wybrano')}
                            </span>
                          </div>
                          <div className="preview-sub-box">
                            <span className="preview-icon">
                              {item.comboConfig.sauce
                                ? <IngredientIcon id={item.comboConfig.sauce.id} label={item.comboConfig.sauce.name} />
                                : <span>—</span>}
                            </span>
                            <span className="preview-label">{item.comboConfig.sauce ? t(item.comboConfig.sauce.name) : t('Nie wybrano')}</span>
                          </div>
                          <div className="preview-sub-box">
                            <span className="preview-icon">
                              {item.comboConfig.drink
                                ? <VisualIcon kind={item.comboConfig.drink.image} label={item.comboConfig.drink.name} photoKey={item.comboConfig.drink.id} />
                                : <span>—</span>}
                            </span>
                            <span className="preview-label">{item.comboConfig.drink ? t(item.comboConfig.drink.name) : t('Nie wybrano')}</span>
                          </div>
                          {item.comboConfig.extra && (
                            <div className="preview-sub-box">
                              <span className="preview-icon"><VisualIcon kind={item.comboConfig.extra.image} label={item.comboConfig.extra.name} /></span>
                              <span className="preview-label">{t(item.comboConfig.extra.name)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="product-ingredients-preview-grid">
                          {displayedIngredients.map((ingredient) => (
                            <div key={ingredient.id} className="preview-sub-box">
                              <span className="preview-icon"><IngredientIcon id={ingredient.id} label={ingredient.name} /></span>
                              <span className="preview-label">{t(ingredient.name)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          className="btn-edit-meal-action"
                          onClick={(e) => handleEditMeal(item, e)}
                          data-aoi="AOI_cel"
                        >
                          {t('Edytuj posiłek')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            /* WERSJA A — nienaruszona 1:1 */
            return (
              <div key={item.id} className="cart-item-card-row">
                <div className="cart-item-main-bar">
                  <div className="cart-item-visual">
                    {item.product.id.startsWith('sauce-')
                      ? <IngredientIcon id={item.product.id} label={item.product.name} />
                      : <VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} />}
                  </div>

                  <div className="cart-item-details-column">
                    <div className="cart-item-name-price-row">
                      <h2 className="cart-item-name-heading">
                        {t(item.product.name)} {item.isCombo ? `(${t('Zestaw')} ${item.comboConfig?.size === 'large' ? t('Powiększony') : t('Standardowy')})` : ''}
                      </h2>
                    </div>

                    {hasDetails && (
                      <div className="cart-item-inline-actions">
                        <button
                          type="button"
                          className="btn-toggle-details"
                          onClick={(e) => toggleDetails(item.id, e)}
                          data-aoi="AOI_cel"
                        >
                          {isExpanded ? t('Ukryj szczegóły') : t('Pokaż szczegóły')}
                        </button>
                      </div>
                    )}

                    {/* Składniki zmodyfikowane w S2 */}
                    {item.customIngredients && item.customIngredients.length > 0 && (
                      <div className="cart-item-custom-note">
                        {t('Personalizacja')}: {item.customIngredients.filter((i) => i.quantity !== 1).map((i) => `${t(i.name)}: ${i.quantity}`).join(', ') || t('Standardowy')}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-controls-column">
                    <div className="cart-qty-price-row">
                      <div className="cart-qty-picker">
                        <button
                          type="button"
                          className="btn-cart-qty-minus"
                          disabled={item.quantity <= 1}
                          onClick={(e) => {
                            eventLogger.logTouch('AOI_cel', 'Zmniejsz ilość pozycji w koszyku', e, 'cart');
                            updateCartQuantity(item.id, -1);
                          }}
                          data-aoi="AOI_cel"
                          aria-label={isVersionB ? t('Zmniejsz ilość') : undefined}
                          title={isVersionB ? t('Zmniejsz ilość') : undefined}
                        >
                          {isVersionB ? (
                            <>
                              <span className="qty-symbol" aria-hidden="true">—</span>
                              <span className="qty-text-label">{t('Zmniejsz')}</span>
                            </>
                          ) : (
                            '—'
                          )}
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
                          aria-label={isVersionB ? t('Zwiększ ilość') : undefined}
                          title={isVersionB ? t('Zwiększ ilość') : undefined}
                        >
                          {isVersionB ? (
                            <>
                              <span className="qty-symbol" aria-hidden="true">+</span>
                              <span className="qty-text-label">{t('Zwiększ')}</span>
                            </>
                          ) : (
                            '+'
                          )}
                        </button>
                      </div>
                      <div className="cart-item-price-sum">{formatPrice(itemTotal)} zł</div>
                    </div>
                    <button
                      type="button"
                      className="btn-cart-item-remove"
                      onClick={(e) => {
                        eventLogger.logTouch('AOI_cel', `Usuń pozycję z koszyka: ${item.product.name}`, e, 'cart');
                        if (isVersionB) {
                          setItemToDelete(item);
                        } else {
                          removeCartItem(item.id);
                        }
                      }}
                      data-aoi="AOI_cel"
                    >
                      {t('Usuń')}
                    </button>

                  </div>
                </div>

                {/* Rozwinięty widok składników produktu lub zestawu */}
                {hasDetails && isExpanded && (
                  <div className="cart-combo-expanded-drawer">
                    {item.isCombo && item.comboConfig ? (
                      <div className="combo-elements-preview-grid">
                        <div className="preview-sub-box">
                          <span className="preview-icon">
                            {item.product.id.startsWith('sauce-')
                              ? <IngredientIcon id={item.product.id} label={item.product.name} />
                              : <VisualIcon kind={item.product.image} label={item.product.name} photoKey={item.product.id} />}
                          </span>
                          <span className="preview-label">{t(item.product.name)}</span>
                        </div>
                        <div className="preview-sub-box">
                          <span className="preview-icon">
                            {item.comboConfig.side === 'frytki'
                              ? <VisualIcon kind="fries" label="Frytki" />
                              : item.comboConfig.side === 'salatka'
                                ? <IngredientIcon id="salad" label="Sałatka" />
                                : <span>—</span>}
                          </span>
                          <span className="preview-label">
                            {item.comboConfig.side
                              ? t(item.comboConfig.side === 'frytki' ? 'Frytki i Dodatki' : 'Sałatka')
                              : 'Nie wybrano'}
                          </span>
                        </div>
                        <div className="preview-sub-box">
                          <span className="preview-icon">
                            {item.comboConfig.sauce
                              ? <IngredientIcon id={item.comboConfig.sauce.id} label={item.comboConfig.sauce.name} />
                              : <span>—</span>}
                          </span>
                          <span className="preview-label">{item.comboConfig.sauce ? t(item.comboConfig.sauce.name) : 'Nie wybrano'}</span>
                        </div>
                        <div className="preview-sub-box">
                          <span className="preview-icon">
                            {item.comboConfig.drink
                              ? <VisualIcon kind={item.comboConfig.drink.image} label={item.comboConfig.drink.name} photoKey={item.comboConfig.drink.id} />
                              : <span>—</span>}
                          </span>
                          <span className="preview-label">{item.comboConfig.drink ? t(item.comboConfig.drink.name) : 'Nie wybrano'}</span>
                        </div>
                        {item.comboConfig.extra && (
                          <div className="preview-sub-box">
                            <span className="preview-icon"><VisualIcon kind={item.comboConfig.extra.image} label={item.comboConfig.extra.name} /></span>
                            <span className="preview-label">{t(item.comboConfig.extra.name)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="product-ingredients-preview-grid">
                        {displayedIngredients.map((ingredient) => (
                          <div key={ingredient.id} className="preview-sub-box">
                            <span className="preview-icon"><IngredientIcon id={ingredient.id} label={ingredient.name} /></span>
                            <span className="preview-label">{t(ingredient.name)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        className="btn-edit-meal-action"
                        onClick={(e) => handleEditMeal(item, e)}
                        data-aoi="AOI_cel"
                      >
                        {t('Edytuj posiłek')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </AllergensScrollbar>

      {/* Podsumowanie kwoty i przyciski zamówienia */}
      {cart.length > 0 && (
        <div className="cart-bottom-checkout-panel">
          <div className="cart-total-display-row">
            <span className="total-label-text">{t('Suma')}</span>
            <span className="total-value-big">{formatPrice(total)} zł</span>
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

      {/* Modal potwierdzenia usunięcia pozycji (Wersja B) */}
      {isVersionB && itemToDelete && (
        <div
          className="kiosk-modal-backdrop"
          onClick={(e) => {
            eventLogger.logTouch('AOI_wstecz', 'Anuluj usunięcie pozycji z koszyka (kliknięcie tła)', e, 'cart');
            setItemToDelete(null);
          }}
        >
          <div
            className="kiosk-remove-item-dialog animated-pop"
            onClick={(e) => e.stopPropagation()}
            data-aoi="AOI_cel"
          >
            <div className="remove-item-icon-bubble" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h2 className="remove-dialog-title">{t('Usunąć tę pozycję?')}</h2>
            <p className="remove-dialog-subtitle">
              {t('Czy na pewno chcesz usunąć tę pozycję ze swojego zamówienia?')}
            </p>

            <div className="remove-dialog-item-preview">
              <div className="remove-item-visual">
                {itemToDelete.product.id.startsWith('sauce-') ? (
                  <IngredientIcon id={itemToDelete.product.id} label={itemToDelete.product.name} />
                ) : (
                  <VisualIcon
                    kind={itemToDelete.product.image}
                    label={itemToDelete.product.name}
                    photoKey={itemToDelete.product.id}
                  />
                )}
              </div>
              <div className="remove-item-info">
                <span className="remove-item-name">
                  {itemToDelete.quantity}× {t(itemToDelete.isCombo ? getComboProductLabel(itemToDelete.product.name) : itemToDelete.product.name)}
                </span>
                <span className="remove-item-price">
                  {formatPrice(itemToDelete.calculatedUnitPrice * itemToDelete.quantity)} zł
                </span>
              </div>
            </div>

            <div className="remove-dialog-buttons">
              <button
                type="button"
                className="btn-remove-cancel"
                onClick={(e) => {
                  eventLogger.logTouch('AOI_wstecz', 'Anuluj usunięcie pozycji z koszyka', e, 'cart');
                  setItemToDelete(null);
                }}
                data-aoi="AOI_wstecz"
              >
                {t('Anuluj')}
              </button>

              <button
                type="button"
                className="btn-remove-confirm"
                onClick={(e) => {
                  eventLogger.logTouch('AOI_cel', `Potwierdź usunięcie pozycji: ${itemToDelete.product.name}`, e, 'cart');
                  removeCartItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                data-aoi="AOI_cel"
              >
                {t('Usuń')}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
};
