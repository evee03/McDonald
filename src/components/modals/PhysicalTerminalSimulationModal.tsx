import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';

export const PhysicalTerminalSimulationModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    getCartTotal,
    completePayment,
    triggerError,
    currentScreen,
  } = useKioskStore();

  const [blikCode, setBlikCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const total = getCartTotal();

  if (activeModal !== 'physical-terminal') return null;

  const handleNfcPay = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Symulator terminala: Zbliżenie karty zbliżeniowej NFC', e, currentScreen);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      closeModal('AOI_cel');
      completePayment();
    }, 1200);
  };

  const handleChipCardPay = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Symulator terminala: Wsunięcie karty z chipem i zatwierdzenie PIN', e, currentScreen);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      closeModal('AOI_cel');
      completePayment();
    }, 1200);
  };

  const handleTerminalError = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_blad', 'Symulator terminala: Wymuszenie błędu transakcji', e, currentScreen);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      closeModal('AOI_blad');
      triggerError('Transakcja odrzucona przez bank. Brak środków lub nieprawidłowy kod PIN. Spróbuj ponownie lub zapłać przy kasie.', 'AOI_blad');
    }, 800);
  };

  const handleBlikSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blikCode.length !== 6) {
      triggerError('Kod BLIK musi zawierać dokładnie 6 cyfr!', 'AOI_blad');
      return;
    }
    eventLogger.logTouch('AOI_cel', `Symulator terminala: Wprowadzono kod BLIK: ${blikCode}`, {} as MouseEvent, currentScreen);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      closeModal('AOI_cel');
      completePayment();
    }, 1500);
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={() => closeModal('AOI_wstecz')}>
      <div
        className="kiosk-terminal-sim-box"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <div className="sim-header">
          <span className="sim-badge">TERMINAL PŁATNICZY PINPAD</span>
          <button
            type="button"
            className="sim-close-btn"
            onClick={() => closeModal('AOI_wstecz')}
            data-aoi="AOI_wstecz"
          >
            ✕
          </button>
        </div>

        <div className="terminal-mini-screen">
          <div className="terminal-screen-status">
            {isProcessing ? 'AUTORYZACJA TRANSAKCJI...' : 'KWOTA DO ZAPŁATY:'}
          </div>
          <div className="terminal-screen-sum">{total.toFixed(2)} PLN</div>
          <div className="terminal-screen-hint">
            {isProcessing ? 'Proszę czekać, nie wyjmuj karty' : 'Zbliż kartę lub wprowadź kod BLIK'}
          </div>
        </div>

        {/* Opcja 1: Zbliżenie karty / telefonu */}
        <div className="sim-terminal-choices">
          <button
            type="button"
            className="btn-sim-action btn-sim-success"
            onClick={handleNfcPay}
            disabled={isProcessing}
            data-aoi="AOI_cel"
          >
            💳 📱 Zbliż kartę płatniczą / Apple Pay / Google Pay
          </button>

          <button
            type="button"
            className="btn-sim-action btn-sim-success"
            onClick={handleChipCardPay}
            disabled={isProcessing}
            data-aoi="AOI_cel"
          >
            📥 Wsuń kartę chipową + PIN (akceptacja)
          </button>

          {/* Opcja 2: BLIK */}
          <form onSubmit={handleBlikSubmit} className="terminal-blik-form">
            <label htmlFor="blik-input-field" className="blik-label">Płatność kodem BLIK (6 cyfr):</label>
            <div className="blik-input-row">
              <input
                id="blik-input-field"
                type="text"
                maxLength={6}
                value={blikCode}
                onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123 456"
                className="blik-field"
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="btn-sim-action btn-blik-confirm"
                disabled={isProcessing || blikCode.length !== 6}
                data-aoi="AOI_cel"
              >
                Zatwierdź BLIK
              </button>
            </div>
          </form>

          {/* Opcja 3: Błąd płatności */}
          <button
            type="button"
            className="btn-sim-action btn-sim-error"
            onClick={handleTerminalError}
            disabled={isProcessing}
            data-aoi="AOI_blad"
          >
            ⚠️ Symuluj błąd terminala (odrzucona transakcja)
          </button>
        </div>
      </div>
    </div>
  );
};
