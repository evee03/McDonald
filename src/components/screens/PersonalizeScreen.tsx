import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { Header } from '../common/Header';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { AllergensScrollbar } from '../common/AllergensScrollbar';
import { BottomBar } from '../common/BottomBar';
import { useT } from '../../i18n';
import { formatPrice } from '../../utils/formatPrice';

export const PersonalizeScreen: React.FC = () => {
  const t = useT();
  const {
    selectedProduct,
    tempIngredients,
    updateIngredientQty,
    resetIngredients,
    savePersonalization,
    goBack,
    interfaceVersion,
  } = useKioskStore();

  const isVersionB = interfaceVersion === 'B';

  if (!selectedProduct) {
    goBack();
    return null;
  }

  const handleQtyChange = (ingId: string, ingName: string, delta: number, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Modyfikacja składnika (${ingName}): ${delta > 0 ? '+' : '-'}`, e, 'personalize');
    updateIngredientQty(ingId, delta);
  };

  const handleReset = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Zresetuj zmiany personalizacji', e, 'personalize');
    resetIngredients();
  };

  const handleSave = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Zapisz zmiany personalizacji', e, 'personalize');
    savePersonalization();
  };

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Cofnij zmiany i wróć', e, 'personalize');
    goBack('AOI_wstecz');
  };

  return (
    <div className="kiosk-page-view personalize-page">
      <Header title={isVersionB ? 'Personalizuj' : undefined} showDineOption={false} />

      <main className="personalize-body-content">
        {/* Karta produktu na górze */}
        <div className="personalize-product-summary-card">
          {!isVersionB && <h1 className="personalize-summary-heading">{t('Personalizuj')}</h1>}
          <div className="summary-left">
            <span className="summary-product-emoji"><VisualIcon kind={selectedProduct.image} label={selectedProduct.name} photoKey={selectedProduct.id} /></span>
            <div className="summary-text-block">
              <strong className="summary-title">{t(selectedProduct.name)}</strong>
              <div className="summary-price">{formatPrice(selectedProduct.price)} zł</div>
            </div>
          </div>

          <button
            type="button"
            className="btn-reset-changes"
            onClick={handleReset}
            data-aoi="AOI_wstecz"
          >
            {t('Zresetuj zmiany')}
          </button>
        </div>

        {/* Lista składników */}
        <div className="ingredients-list-section">
          <h2 className="ingredients-section-heading">{t('W zestawie z:')}</h2>

          <AllergensScrollbar
            className="personalize-ingredients-scroll-shell"
            contentClassName="personalize-ingredients-scroll-body"
            contentElement="div"
          >
            <div className="ingredients-rows-container">
              {tempIngredients.map((ing) => (
                <div key={ing.id} className="ingredient-edit-row">
                  <div className="ing-icon-area"><IngredientIcon id={ing.id} label={t(ing.name)} /></div>
                  <div className="ing-name-area">
                    <span className="ing-name-text">{t(ing.name)}</span>
                  </div>

                  <div className="ing-quantity-controls">
                    <button
                      type="button"
                      className="ing-qty-btn ing-minus"
                      disabled={ing.quantity <= ing.minQuantity}
                      onClick={(e) => handleQtyChange(ing.id, ing.name, -1, e)}
                      data-aoi="AOI_cel"
                      aria-label={isVersionB ? `${t('Zmniejsz')}: ${t(ing.name)}` : undefined}
                      title={isVersionB ? t('Zmniejsz') : undefined}
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

                    <span className="ing-qty-display">{ing.quantity}</span>

                    <button
                      type="button"
                      className="ing-qty-btn ing-plus"
                      disabled={ing.quantity >= ing.maxQuantity}
                      onClick={(e) => handleQtyChange(ing.id, ing.name, 1, e)}
                      data-aoi="AOI_cel"
                      aria-label={isVersionB ? `${t('Zwiększ')}: ${t(ing.name)}` : undefined}
                      title={isVersionB ? t('Zwiększ') : undefined}
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
                </div>
              ))}
            </div>
          </AllergensScrollbar>
        </div>

        {/* Dolny pasek zapisu i powrotu */}
        <div className="personalize-bottom-actions">
          <button
            type="button"
            className="btn-personalize-cancel"
            onClick={handleCancel}
            data-aoi="AOI_wstecz"
          >
            {t('Cofnij zmiany')}
          </button>

          <button
            type="button"
            className="btn-personalize-save"
            onClick={handleSave}
            data-aoi="AOI_cel"
          >
            {t('Zapisz zmiany')}
          </button>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};
