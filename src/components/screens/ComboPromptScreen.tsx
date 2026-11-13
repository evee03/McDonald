import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { Header } from '../common/Header';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const ComboPromptScreen: React.FC = () => {
  const t = useT();
  const {
    selectedProduct,
    startComboBuilder,
    addProductToCart,
    navigateTo,
    toggleAccessibility,
    isAccessibilityMode,
  } = useKioskStore();

  if (!selectedProduct) {
    navigateTo('menu');
    return null;
  }

  const handleSelectCombo = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór: Tak, chcę zamówić Zestaw (${selectedProduct.name})`, e, 'combo-prompt');
    startComboBuilder(selectedProduct);
  };

  const handleSelectOnlyProduct = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór: Chcę tylko ten produkt (${selectedProduct.name})`, e, 'combo-prompt');
    addProductToCart(selectedProduct, 1);
  };

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Anuluj wybór zestawu', e, 'combo-prompt');
    navigateTo('menu', 'AOI_wstecz', 'Powrót do menu');
  };

  const handleAccessibility = (e: React.MouseEvent) => {
    eventLogger.logTouch(
      'AOI_dostepnosc',
      `Przycisk Dostępność (${isAccessibilityMode ? 'wyłącz' : 'włącz'})`,
      e,
      'combo-prompt'
    );
    toggleAccessibility();
  };

  const handleLanguageSelection = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Otwarcie ekranu dostępnych języków', e, 'combo-prompt');
    navigateTo('language-select', 'AOI_cel', 'Dostępne języki');
  };

  return (
    <div className="kiosk-page-view combo-prompt-page">
      <Header title={t(selectedProduct.name)} />

      <main className="combo-prompt-body">
        <h1 className="prompt-headline">{t('A może z dodatkami jako Zestaw?')}</h1>

        <div className="prompt-choice-cards">
          {/* Opcja 1: Zestaw */}
          <div
            className="prompt-card combo-yes-card"
            onClick={handleSelectCombo}
            data-aoi="AOI_cel"
          >
            <div className="prompt-card-visual">
              <VisualIcon kind="meal" label="Zestaw" />
            </div>
            <h2 className="prompt-card-label">{t('Tak, chcę zamówić Zestaw')}</h2>
            <span className="prompt-card-sublabel">{t('Więcej smaku w zestawie z frytkami i napojem')}</span>
          </div>

          {/* Opcja 2: Tylko ten produkt */}
          <div
            className="prompt-card combo-no-card"
            onClick={handleSelectOnlyProduct}
            data-aoi="AOI_cel"
          >
            <div className="prompt-card-visual">
              <span className="single-icon-big"><VisualIcon kind={selectedProduct.image} label={selectedProduct.name} photoKey={selectedProduct.id} /></span>
            </div>
            <h2 className="prompt-card-label">{t('Chcę tylko ten produkt')}</h2>
            <div className="prompt-card-single-price">{selectedProduct.price.toFixed(2)} zł</div>
          </div>
        </div>

        <div className="prompt-footer-bar">
          <button
            type="button"
            className="btn-prompt-cancel"
            onClick={handleCancel}
            data-aoi="AOI_wstecz"
          >
            {t('Anuluj')}
          </button>
        </div>
      </main>

      <footer className="prompt-screen-utilities">
        <button
          type="button"
          className={`utility-action-btn accessibility-btn ${isAccessibilityMode ? 'active' : ''}`}
          onClick={handleAccessibility}
          data-aoi="AOI_dostepnosc"
        >
          <span className="a11y-icon"><VisualIcon kind="accessibility" label="Dostępność" /></span>
          <span>{t('Dostępność')}</span>
        </button>

        <button
          type="button"
          className="utility-action-btn prompt-language-btn"
          onClick={handleLanguageSelection}
          data-aoi="AOI_cel"
          aria-label={t('Dostępne języki')}
          title={t('Dostępne języki')}
        >
          <span className="welcome-language-code" aria-hidden="true">文</span>
          <span>{t('Języki')}</span>
        </button>
      </footer>
    </div>
  );
};
