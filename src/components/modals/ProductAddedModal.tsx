import React from 'react';
import { useT } from '../../i18n';
import { eventLogger } from '../../logger/eventLogger';
import { useKioskStore } from '../../store/kioskStore';
import { formatPrice } from '../../utils/formatPrice';
import { VisualIcon } from '../common/VisualIcon';

export const ProductAddedModal: React.FC = () => {
  const t = useT();
  const { activeModal, closeModal, getCartTotal, currentScreen, navigateTo } = useKioskStore();

  const total = getCartTotal();
  const isPaymentFlow = currentScreen === 'cart';

  if (activeModal !== 'product-added') return null;

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
};
