import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';

export const ScanCodeScreen: React.FC = () => {
  const { goBack, triggerError, openModal, currentScreen } = useKioskStore();
  const [enteredCode, setEnteredCode] = useState('');

  const handleKeyClick = (char: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Klawisz klawiatury: ${char}`, e, currentScreen);
    setEnteredCode((c) => c + char);
  };

  const handleBackspace = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Klawisz Backspace', e, currentScreen);
    setEnteredCode((c) => c.slice(0, -1));
  };

  const handleSpace = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Klawisz Spacja', e, currentScreen);
    setEnteredCode((c) => c + ' ');
  };

  const handleClear = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Klawisz Wyczyść', e, currentScreen);
    setEnteredCode('');
  };

  const handleContinue = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Weryfikacja kodu z klawiatury: ${enteredCode}`, e, currentScreen);
    if (enteredCode.trim().toUpperCase() === 'RABAT10') {
      alert('Kod rabatowy zaakceptowany!');
      goBack();
    } else {
      triggerError('Coś poszło nie tak. Upewnij się, że kod kuponu lub karty jest poprawny. Kliknij „OK”, by kontynuować.', 'AOI_blad');
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Powrót ze skanowania (Cofnij)', e, currentScreen);
    goBack('AOI_wstecz');
  };

  const handleOpenScannerSim = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Otwarcie symulacji fizycznego skanera', e, currentScreen);
    openModal('physical-scanner');
  };

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="kiosk-page-view scan-code-page">
      {/* Górna połowa: Ręczne wprowadzanie kodu na klawiaturze */}
      <div className="scan-upper-white-area">
        <h1 className="scan-upper-title">Wprowadź kod</h1>
        <p className="scan-upper-subtitle">
          Znajdziesz go w aplikacji przy kodzie kreskowym/QR
        </p>

        {/* Pole tekstowe */}
        <div className="scan-code-input-display" data-aoi="AOI_cel">
          {enteredCode || <span className="placeholder-text">Wpisz kod...</span>}
        </div>

        {/* Pełna klawiatura ekranowa */}
        <div className="onscreen-qwerty-keyboard">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="keyboard-row">
              {row.map((char) => (
                <button
                  type="button"
                  key={char}
                  className="key-button"
                  onClick={(e) => handleKeyClick(char, e)}
                  data-aoi="AOI_cel"
                >
                  {char}
                </button>
              ))}
              {rIdx === 3 && (
                <button
                  type="button"
                  className="key-button key-backspace"
                  onClick={handleBackspace}
                  data-aoi="AOI_cel"
                  title="Usuń znak"
                >
                  ⌫
                </button>
              )}
            </div>
          ))}

          <div className="keyboard-row keyboard-special-row">
            <button
              type="button"
              className="key-button key-space"
              onClick={handleSpace}
              data-aoi="AOI_cel"
            >
              Spacja
            </button>
            <button
              type="button"
              className="key-button key-clear"
              onClick={handleClear}
              data-aoi="AOI_wstecz"
            >
              Wyczyść
            </button>
          </div>
        </div>

        <div className="scan-upper-action-row">
          <button
            type="button"
            className="btn-scan-upper-back"
            onClick={handleBack}
            data-aoi="AOI_wstecz"
          >
            Cofnij
          </button>

          <button
            type="button"
            className={`btn-scan-upper-next ${enteredCode ? 'ready' : ''}`}
            onClick={handleContinue}
            data-aoi="AOI_cel"
          >
            Kontynuuj
          </button>
        </div>
      </div>

      {/* Dolna połowa: Żółty panel skanera fizycznego */}
      <div className="scan-lower-yellow-area" onClick={handleOpenScannerSim} data-aoi="AOI_cel">
        <div className="yellow-scanner-left">
          <h2 className="yellow-scanner-heading">Zeskanuj kod</h2>
          <p className="yellow-scanner-promo">
            Punkty, nagrody, okazje? <strong>Użyj skanera poniżej!</strong>
          </p>
          <span className="yellow-scanner-hint">Kod QR / kreskowy</span>
        </div>

        <div className="yellow-scanner-right">
          <div className="scanner-phone-graphic-box">
            <span className="phone-illustration">📱</span>
            <div className="scanner-red-laser-effect"></div>
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
};
