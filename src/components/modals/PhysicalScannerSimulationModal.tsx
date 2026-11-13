import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';

export const PhysicalScannerSimulationModal: React.FC = () => {
  const { activeModal, closeModal, triggerError, navigateTo, currentScreen } = useKioskStore();
  const [isScanning, setIsScanning] = useState(false);

  if (activeModal !== 'physical-scanner') return null;

  const handleSimulateValidScan = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Symulator skanera: Zeskanowano poprawny kod kuponu', e, currentScreen);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      closeModal('AOI_cel');
      alert('Kod rabatowy aplikacji zaakceptowany! Należność zaktualizowana.');
    }, 800);
  };

  const handleSimulateInvalidScan = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Symulator skanera: Zeskanowano niepoprawny kod', e, currentScreen);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      closeModal('AOI_blad');
      triggerError('Coś poszło nie tak. Upewnij się, że kod aplikacji lub karty jest poprawny. Kliknij „OK”, by kontynuować.', 'AOI_blad');
    }, 800);
  };

  const handleManualCodeEntry = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Symulator skanera: Wybór ręcznego wpisania kodu', e, currentScreen);
    closeModal('AOI_cel');
    navigateTo('scan-code', 'AOI_cel', 'Ręczne wprowadzanie kodu');
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={() => closeModal('AOI_wstecz')}>
      <div
        className="kiosk-scanner-sim-box"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <div className="sim-header">
          <span className="sim-badge">INTERAKTYWNY SKANER FIZYCZNY</span>
          <button
            type="button"
            className="sim-close-btn"
            onClick={() => closeModal('AOI_wstecz')}
            data-aoi="AOI_wstecz"
          >
            ✕
          </button>
        </div>

        <h3 className="sim-title">Czytnik optyczny kodów QR / kreskowych</h3>
        <p className="sim-desc">
          Zeskanuj ekran telefonu pod czytnikiem optycznym lub wybierz opcję symulacji:
        </p>

        <div className={`scanner-visual-bay ${isScanning ? 'scanning-active' : ''}`}>
          <div className="scanner-optical-target">
            <span className="scanner-phone-icon">📱</span>
            <div className="laser-beam-animated"></div>
          </div>
          <span className="scanner-status-text">
            {isScanning ? 'Odczytywanie kodu kreskowego...' : 'Czuwanie: Zbliż kod do okienka czytnika'}
          </span>
        </div>

        <div className="sim-action-buttons">
          <button
            type="button"
            className="btn-sim-action btn-sim-success"
            onClick={handleSimulateValidScan}
            disabled={isScanning}
            data-aoi="AOI_cel"
          >
            🟢 Zbliż poprawny kod aplikacji / rabat
          </button>

          <button
            type="button"
            className="btn-sim-action btn-sim-error"
            onClick={handleSimulateInvalidScan}
            disabled={isScanning}
            data-aoi="AOI_blad"
          >
            🔴 Zbliż nieczytelny kod (wymuszenie błędu)
          </button>

          <button
            type="button"
            className="btn-sim-action btn-sim-secondary"
            onClick={handleManualCodeEntry}
            disabled={isScanning}
            data-aoi="AOI_cel"
          >
            ⌨️ Wprowadź kod ręcznie na klawiaturze
          </button>
        </div>
      </div>
    </div>
  );
};
