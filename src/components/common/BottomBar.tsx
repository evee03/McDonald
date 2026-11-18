import React from 'react';
import { useT } from '../../i18n';
import { eventLogger } from '../../logger/eventLogger';
import type { FontSizeLevel } from '../../store/kioskStore';
import { useKioskStore } from '../../store/kioskStore';
import { formatPrice } from '../../utils/formatPrice';
import { VisualIcon } from './VisualIcon';

export const BottomBar: React.FC = () => {
  const {
    getCartTotal,
    getCartItemsCount,
    navigateTo,
    toggleAccessibility,
    isAccessibilityMode,
    fontSizeLevel,
    setFontSizeLevel,
    interfaceVersion,
    currentScreen,
  } = useKioskStore();
  const t = useT();

  const total = getCartTotal();
  const count = getCartItemsCount();
  const isVersionB = interfaceVersion === 'B';

  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (count === 0) return;
    eventLogger.logTouch('AOI_cel', 'Przejdź do podsumowania', e, currentScreen, {
      total,
      count,
    });
    navigateTo('cart', 'AOI_cel', 'Przejście do podsumowania zamówienia');
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

  const handleFontSizeClick = (level: FontSizeLevel, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_dostepnosc', `Zmiana rozmiaru czcionki: poziom ${level}`, e, currentScreen);
    setFontSizeLevel(level);
  };

  /* ---- WERSJA B ---- */
  if (isVersionB) {
    const showCartSection = currentScreen === 'menu';
    return (
      <div className={`bottom-bar-container bottom-bar-b ${!showCartSection ? 'bottom-bar-b--a11y-only' : ''}`}>
        {/* Sekcja transakcyjna – koszyk (tylko na ekranie menu) */}
        {showCartSection && (
          <div className="bb-b-cart-section">
            <div className="bb-b-cart-info">
              <div className="cart-icon-wrapper">
                <span className="cart-icon"><VisualIcon kind="bag" label="Koszyk" /></span>
                {count > 0 && <span className="cart-counter">{count}</span>}
              </div>
              <div className="bb-b-cart-text">
                <span className="bb-b-cart-count">
                  {count === 0
                    ? t('Koszyk pusty')
                    : count === 1
                      ? t('1 produkt')
                      : `${count} ${t('produkty/produktów')}`}
                </span>
                <span className="bb-b-cart-price">{formatPrice(total)} zł</span>
              </div>
            </div>
            <button
              type="button"
              className={`btn-checkout btn-checkout-b ${count > 0 ? 'active' : 'disabled'}`}
              disabled={count === 0}
              onClick={handleCheckoutClick}
              data-aoi="AOI_cel"
            >
              {t('Przejdź do podsumowania')}
            </button>
          </div>
        )}

        {/* Sekcja dostępności */}
        <div className="bb-b-a11y-section">
          <button
            type="button"
            className={`utility-action-btn accessibility-btn ${isAccessibilityMode ? 'active' : ''}`}
            onClick={handleAccessibilityClick}
            data-aoi="AOI_dostepnosc"
            title={t('Obniża położenie elementów ekranu')}
          >
            <span className="a11y-icon"><VisualIcon kind="accessibility" label="Dostępność" /></span>
            <span>{isAccessibilityMode ? t('Przywróć ekran') : t('Obniż ekran')}</span>
          </button>

          <div className="bb-b-font-size-group" role="group" aria-label={t('Rozmiar czcionki')}>
            <span className="bb-b-font-label">{t('Rozmiar czcionki:')}</span>
            {([0, 1, 2] as FontSizeLevel[]).map((level) => {
              const labels = ['A', 'A+', 'A++'];
              return (
                <button
                  key={level}
                  type="button"
                  className={`bb-b-font-btn bb-b-font-btn--${level} ${fontSizeLevel === level ? 'active' : ''}`}
                  onClick={(e) => handleFontSizeClick(level, e)}
                  data-aoi="AOI_dostepnosc"
                  aria-pressed={fontSizeLevel === level}
                  title={`${t('Rozmiar czcionki')} ${labels[level]}`}
                >
                  {labels[level]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---- WERSJA A (oryginalna) ---- */
  if (currentScreen !== 'menu') return null;
  return (
    <div className="bottom-bar-container">
      {/* Pasek podsumowania koszyka */}
      <div className="bottom-cart-summary">
        <div className="cart-total-badge">
          <div className="cart-icon-wrapper">
            <span className="cart-icon"><VisualIcon kind="bag" label="Koszyk" /></span>
            {count > 0 && <span className="cart-counter">{count}</span>}
          </div>
          <span className="cart-price-text">{formatPrice(total)} zł</span>
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
        <div className="utility-buttons-right">
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
