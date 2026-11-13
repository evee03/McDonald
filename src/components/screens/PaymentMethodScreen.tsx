import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const PaymentMethodScreen: React.FC = () => {
  const t = useT();
  const { startCardPayment, completePayment, goBack } = useKioskStore();

  const handleCardOrBlik = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Wybór: Zapłać tutaj kartą lub BLIKIEM', e, 'payment-method');
    startCardPayment();
  };

  const handleCashAtCounter = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Wybór: Zapłać przy kasie (gotówka)', e, 'payment-method');
    // Bezpośrednie wydanie numerka i przekierowanie do kasy
    completePayment();
  };

  const handleBack = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Powrót z wyboru płatności (Cofnij)', e, 'payment-method');
    goBack('AOI_wstecz');
  };

  return (
    <div className="kiosk-page-view payment-method-page">
      <header className="payment-method-header">
        <div className="kiosk-neutral-logo">M</div>
      </header>

      <main className="payment-method-body">
        <h1 className="payment-method-title">{t('Wybierz typ płatności')}</h1>

        <div className="payment-method-choices">
          {/* Główny kafelek: Zapłać tutaj kartą lub BLIKIEM */}
          <div
            className="payment-card-option terminal-card-option"
            onClick={handleCardOrBlik}
            data-aoi="AOI_cel"
          >
            <div className="payment-card-visual">
              <VisualIcon kind="card" label="Płatność kartą" />
            </div>
            <h2 className="payment-option-heading">{t('Zapłać kartą')}</h2>
            <span className="payment-option-subtext">{t('Płatność bezgotówkowa')}</span>
          </div>

          <div className="payment-or-text">{t('lub')}</div>

          {/* Przycisk: Zapłać przy kasie */}
          <button
            type="button"
            className="btn-pay-at-cashier"
            onClick={handleCashAtCounter}
            data-aoi="AOI_cel"
          >
            {t('Zapłać przy kasie (gotówka)')}
          </button>

          {/* Przycisk Cofnij */}
          <button
            type="button"
            className="btn-payment-back"
            onClick={handleBack}
            data-aoi="AOI_wstecz"
          >
            {t('Cofnij')}
          </button>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};
