import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';
import { useT } from '../../i18n';

export const ScanCodeScreen: React.FC = () => {
  const t = useT();
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
      alert(t('Kod rabatowy zaakceptowany!'));
      goBack();
    } else {
      triggerError(t('Coś poszło nie tak. Upewnij się, że kod kuponu lub karty jest poprawny. Kliknij „OK”, by kontynuować.'), 'AOI_blad');
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
        <h1 className="scan-upper-title">{t('Wprowadź kod')}</h1>
        <p className="scan-upper-subtitle">
          {t('Znajdziesz go w aplikacji przy kodzie kreskowym/QR')}
        </p>

        {/* Pole tekstowe */}
        <div className="scan-code-input-display" data-aoi="AOI_cel">
          {enteredCode || <span className="placeholder-text">{t('Wpisz kod...')}</span>}
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
                  title={t('Usuń znak')}
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
              {t('Spacja')}
            </button>
            <button
              type="button"
              className="key-button key-clear"
              onClick={handleClear}
              data-aoi="AOI_wstecz"
            >
              {t('Wyczyść')}
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
            {t('Cofnij')}
          </button>

          <button
            type="button"
            className={`btn-scan-upper-next ${enteredCode ? 'ready' : ''}`}
            onClick={handleContinue}
            data-aoi="AOI_cel"
          >
            {t('Kontynuuj')}
          </button>
        </div>
      </div>

      {/* Dolna połowa: Żółty panel skanera fizycznego */}
      <div className="scan-lower-yellow-area" onClick={handleOpenScannerSim} data-aoi="AOI_cel">
        <div className="yellow-scanner-left">
          <h2 className="yellow-scanner-heading">{t('Zeskanuj kod')}</h2>
          <p className="yellow-scanner-promo">
            {t('Punkty, nagrody, okazje?')} <strong>{t('Użyj skanera poniżej!')}</strong>
          </p>
          <span className="yellow-scanner-hint">{t('Kod QR / kreskowy')}</span>
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
