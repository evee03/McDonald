import React, { useEffect } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

export const PaymentProcessingScreen: React.FC = () => {
  const t = useT();
  const {
    paymentTerminalStep,
    advanceTerminalStep,
    completePayment,
  } = useKioskStore();

  useEffect(() => {
    // Automatyczna sekwencja instrukcji terminala
    if (paymentTerminalStep === 1) {
      const timer = setTimeout(() => {
        advanceTerminalStep(2); // Przejście do: Polaczenie ...
      }, 2000);
      return () => clearTimeout(timer);
    } else if (paymentTerminalStep === 2) {
      const timer = setTimeout(() => {
        advanceTerminalStep(3); // Przejście do: Wprowadź kartę
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentTerminalStep, advanceTerminalStep]);

  const handleConfirmPayment = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Potwierdzenie płatności kartą na ekranie', e, 'payment-processing');
    advanceTerminalStep(4);
    setTimeout(() => {
      completePayment();
    }, 1200);
  };

  return (
    <div className="kiosk-page-view payment-processing-page">
      <header className="processing-header">
        <div className="kiosk-neutral-logo">M</div>
      </header>

      <main className="processing-content-center">
        {paymentTerminalStep === 1 && (
          <div className="processing-step-box animated-fade">
            <h1 className="processing-instruction-text">
              {t('Przygotuj kartę do płatności.')}
            </h1>
            <div className="terminal-down-arrow-indicator">↓</div>
          </div>
        )}

        {paymentTerminalStep === 2 && (
          <div className="processing-step-box animated-fade">
            <h1 className="processing-instruction-text">{t('Łączenie z bankiem…')}</h1>
            <div className="processing-spinner-circle"></div>
          </div>
        )}

        {paymentTerminalStep === 3 && (
          <div className="processing-step-box animated-fade">
            <h1 className="processing-instruction-text">{t('Wprowadź kartę')}</h1>
            <p className="processing-instruction-sub">
              {t('Wybierz przycisk, aby zakończyć symulację płatności.')}
            </p>
            <div className="card-swipe-animation-visual">
              <span className="card-motion-icon">••••</span>
            </div>
          </div>
        )}

        {paymentTerminalStep === 4 && (
          <div className="processing-step-box animated-fade">
            <h1 className="processing-instruction-text">{t('Autoryzacja transakcji...')}</h1>
            <div className="processing-spinner-circle"></div>
          </div>
        )}

        <div className="processing-sim-floating-bar">
          <button
            type="button"
            className="btn-proc-sim-quick"
            onClick={handleConfirmPayment}
            data-aoi="AOI_cel"
          >
            {t('Potwierdź płatność')}
          </button>
        </div>
      </main>
    </div>
  );
};
