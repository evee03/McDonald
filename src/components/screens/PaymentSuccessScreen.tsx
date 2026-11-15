import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

export const PaymentSuccessScreen: React.FC = () => {
  const t = useT();
  const { activeScenario, resetAll, setScenario } = useKioskStore();
  const isFinalScenario = activeScenario === 'S3';

  const handleFinishNow = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Zakończono zamówienie (Nowe zamówienie)', e, 'payment-success');
    if (activeScenario === 'S1') setScenario('S2');
    if (activeScenario === 'S2') setScenario('S3');
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

        {!isFinalScenario && (
          <button
            type="button"
            className="btn-success-finish"
            onClick={handleFinishNow}
            data-aoi="AOI_cel"
          >
            {t('Zakończ')}
          </button>
        )}
      </main>

      {isFinalScenario && (
        <div className="kiosk-modal-backdrop">
          <div
            className="scenario-thanks-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scenario-thanks-title"
          >
            <h2 id="scenario-thanks-title">Dziękujemy</h2>
            <p>Wszystkie scenariusze zostały zakończone.</p>
          </div>
        </div>
      )}
    </div>
  );
};
