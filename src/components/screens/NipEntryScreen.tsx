import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';

export const NipEntryScreen: React.FC = () => {
  const {
    nipInput,
    appendNipDigit,
    backspaceNip,
    clearNip,
    submitNip,
    navigateTo,
  } = useKioskStore();

  const handleDigit = (digit: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Cyfra NIP: ${digit}`, e, 'nip-entry');
    appendNipDigit(digit);
  };

  const handleBackspace = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'NIP: Cofnij cyfrę (backspace)', e, 'nip-entry');
    backspaceNip();
  };

  const handleClear = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'NIP: Wyczyść wszystko', e, 'nip-entry');
    clearNip();
  };

  const handleCancelInvoice = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Pominięcie faktury (Anuluj / Bez NIP)', e, 'nip-entry');
    // Bez faktury przechodzimy bezpośrednio do pytania o darowiznę
    navigateTo('donation', 'AOI_wstecz', 'Przejście do darowizny bez NIP');
  };

  const handleSubmit = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Zatwierdzenie NIP (${nipInput})`, e, 'nip-entry');
    submitNip();
  };

  return (
    <div className="kiosk-page-view nip-entry-page">
      <main className="nip-entry-body">
        <h1 className="nip-page-title">Chcesz fakturę?</h1>
        <p className="nip-page-subtitle">Podaj numer NIP</p>

        {/* Wyświetlacz wprowadzonego NIP */}
        <div className="nip-display-box" data-aoi="AOI_cel">
          <span className="nip-value-text">{nipInput || '— — — — — — — — — —'}</span>
          <span className="nip-digits-counter">{nipInput.length}/10</span>
        </div>

        {/* Ekranowa klawiatura numeryczna */}
        <div className="nip-numpad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              type="button"
              key={num}
              className="numpad-key-btn"
              onClick={(e) => handleDigit(num.toString(), e)}
              data-aoi="AOI_cel"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            className="numpad-key-btn numpad-backspace-btn"
            onClick={handleBackspace}
            data-aoi="AOI_cel"
            title="Usuń ostatnią cyfrę"
          >
            ⌫
          </button>

          <button
            type="button"
            className="numpad-key-btn"
            onClick={(e) => handleDigit('0', e)}
            data-aoi="AOI_cel"
          >
            0
          </button>

          <button
            type="button"
            className="numpad-key-btn numpad-clear-btn"
            onClick={handleClear}
            data-aoi="AOI_wstecz"
            title="Wyczyść całe pole"
          >
            C
          </button>
        </div>

        {/* Przyciski funkcyjne */}
        <div className="nip-action-controls">
          <button
            type="button"
            className="btn-nip-clear-wide"
            onClick={handleClear}
            data-aoi="AOI_wstecz"
          >
            Wyczyść
          </button>

          <div className="nip-bottom-row-btns">
            <button
              type="button"
              className="btn-nip-cancel"
              onClick={handleCancelInvoice}
              data-aoi="AOI_wstecz"
            >
              Anuluj
            </button>

            <button
              type="button"
              className="btn-nip-submit"
              onClick={handleSubmit}
              data-aoi="AOI_cel"
            >
              Dodaj
            </button>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};
