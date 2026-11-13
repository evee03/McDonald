import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

export const PaymentSuccessScreen: React.FC = () => {
  const t = useT();
  const { resetAll } = useKioskStore();

  const handleFinishNow = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Zakończono zamówienie (Nowe zamówienie)', e, 'payment-success');
    resetAll();
  };

  return (
    <div className="kiosk-page-view payment-success-page">
      <header className="success-header">
        <div className="kiosk-neutral-logo">M</div>
      </header>

      <main className="success-body-center">
        <div className="success-green-check-circle">✓</div>

        <h1 className="success-headline">{t('Dziękujemy za zamówienie!')}</h1>
        <p className="success-subheading">{t('Płatność została pomyślnie zrealizowana.')}</p>

        <button
          type="button"
          className="btn-success-finish"
          onClick={handleFinishNow}
          data-aoi="AOI_cel"
        >
          {t('Zakończ / Nowe zamówienie')}
        </button>
      </main>
    </div>
  );
};
