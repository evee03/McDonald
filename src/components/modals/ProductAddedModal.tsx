import React, { useEffect } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const ProductAddedModal: React.FC = () => {
  const t = useT();
  const { activeModal, openModal, getCartTotal, currentScreen } = useKioskStore();

  const total = getCartTotal();

  useEffect(() => {
    if (activeModal === 'product-added') {
      const timer = setTimeout(() => {
        // Po krótkiej chwili proponujemy Upsell ("A może coś jeszcze?")
        openModal('upsell');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeModal, openModal]);

  if (activeModal !== 'product-added') return null;

  const handleContinue = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Potwierdzenie dodania produktu', e, currentScreen);
    openModal('upsell');
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

        <div className="added-total-amount">{total.toFixed(2)} zł</div>

        <button
          type="button"
          className="btn-added-continue"
          onClick={handleContinue}
          data-aoi="AOI_cel"
        >
          {t('Dalej →')}
        </button>
      </div>
    </div>
  );
};
