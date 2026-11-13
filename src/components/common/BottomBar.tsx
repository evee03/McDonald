import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { VisualIcon } from './VisualIcon';
import { useT } from '../../i18n';

export const BottomBar: React.FC = () => {
  const {
    getCartTotal,
    getCartItemsCount,
    navigateTo,
    openModal,
    toggleAccessibility,
    isAccessibilityMode,
    currentScreen,
  } = useKioskStore();
  const t = useT();

  const total = getCartTotal();
  const count = getCartItemsCount();

  if (currentScreen !== 'menu') return null;

  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (count === 0) return;
    eventLogger.logTouch('AOI_cel', 'Przejdź do podsumowania', e, currentScreen, {
      total,
      count,
    });
    navigateTo('cart', 'AOI_cel', 'Przejście do koszyka');
  };

  const handleRestartClick = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Kliknięcie: Zacznij od nowa', e, currentScreen);
    openModal('restart-confirm');
  };

  const handleAccessibilityClick = (e: React.MouseEvent) => {
    eventLogger.logTouch(
      'AOI_dostepnosc',
      `Przycisk Dostępność (${isAccessibilityMode ? 'wyłącz' : 'włącz'})`,
      e,
      currentScreen
    );
    toggleAccessibility();
  };

  return (
    <div className="bottom-bar-container">
      {/* Pasek podsumowania koszyka (jeśli nie jesteśmy na ekranie powitalnym) */}
      <div className="bottom-cart-summary">
          <div className="cart-total-badge">
            <div className="cart-icon-wrapper">
              <span className="cart-icon"><VisualIcon kind="bag" label="Koszyk" /></span>
              {count > 0 && <span className="cart-counter">{count}</span>}
            </div>
            <span className="cart-price-text">{total.toFixed(2)} zł</span>
          </div>

          <button
            type="button"
            className={`btn-checkout ${count > 0 ? 'active' : 'disabled'}`}
            disabled={count === 0}
            onClick={handleCheckoutClick}
            data-aoi="AOI_cel"
          >
            {t('Przejdź do podsumowania')}
          </button>
      </div>

      {/* Dolny pasek ekranowy */}
      <div className="bottom-utilities-row">
        <div className="utility-buttons-right" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className="utility-action-btn"
            onClick={handleRestartClick}
            data-aoi="AOI_wstecz"
          >
            {t('Zacznij od nowa')}
          </button>

          <button
            type="button"
            className={`utility-action-btn accessibility-btn ${isAccessibilityMode ? 'active' : ''}`}
            onClick={handleAccessibilityClick}
            data-aoi="AOI_dostepnosc"
            title="Obniża interfejs dla osób na wózkach i niskiego wzrostu"
          >
            <span className="a11y-icon"><VisualIcon kind="accessibility" label="Dostępność" /></span>
            <span>{t('Dostępność')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
