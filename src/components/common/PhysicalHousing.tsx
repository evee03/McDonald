import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';

interface PhysicalHousingProps {
  children: React.ReactNode;
}

export const PhysicalHousing: React.FC<PhysicalHousingProps> = ({ children }) => {
  const { currentScreen, orderNumber, isAccessibilityMode, openModal } = useKioskStore();
  const [cardInserted, setCardInserted] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  // Symulacja skanera kodów QR
  const handlePhysicalScanTrigger = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Fizyczny skaner QR: Zbliżono telefon', e, currentScreen);
    setScannerActive(true);
    setTimeout(() => {
      setScannerActive(false);
      openModal('physical-scanner');
    }, 600);
  };

  // Symulacja włożenia karty płatniczej
  const handleInsertCardTrigger = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Fizyczny terminal: Zbliżono kartę / włożono chip', e, currentScreen);
    setCardInserted(!cardInserted);
    if (currentScreen === 'payment-processing') {
      openModal('physical-terminal');
    }
  };

  // Wyjęcie paragonu
  const handleTakeReceipt = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Odebranie paragonu z drukarki', e, currentScreen);
    setReceiptPrinted(false);
  };

  React.useEffect(() => {
    if (currentScreen === 'payment-success') {
      setReceiptPrinted(true);
    }
  }, [currentScreen]);

  return (
    <div className="kiosk-physical-totem">
      {/* Górna część obudowy: kamera EyeTrackera i logo */}
      <div className="totem-top-header">
        <div className="eyetracker-sensor-bar" title="Sensor eyetrackera do badań iMotions">
          <span className="sensor-lens"></span>
          <span className="sensor-ir-light"></span>
          <span className="sensor-label">EYE TRACKING SENSOR • 60Hz</span>
          <span className="sensor-status-dot active"></span>
        </div>
      </div>

      {/* Ekran kiosku 9:16 (wirtualny wyświetlacz pionowy 32 cale) */}
      <div className={`kiosk-screen-viewport ${isAccessibilityMode ? 'a11y-lowered' : ''}`}>
        {/* Pusty obszar w trybie dostępności dla obniżenia elementów */}
        {isAccessibilityMode && (
          <div className="a11y-blank-upper-space">
            <div className="a11y-indicator-banner">
              ♿ Tryb obniżonego interfejsu (dostępność dla wózków inwalidzkich)
            </div>
          </div>
        )}
        <div className="kiosk-screen-content">{children}</div>
      </div>

      {/* Dolny moduł fizyczny kiosku: Skaner kodów, Terminal PIN, Drukarka paragonów */}
      <div className="totem-bottom-hardware">
        {/* Skaner kodów QR */}
        <div
          className={`hardware-unit scanner-bay ${scannerActive ? 'scanning-laser' : ''}`}
          onClick={handlePhysicalScanTrigger}
          title="Fizyczny skaner kodów QR i kreskowych (kliknij aby symulować)"
          data-aoi="AOI_cel"
        >
          <div className="scanner-glass-window">
            <div className="scanner-laser-line"></div>
            <span className="scanner-glyph">📷</span>
          </div>
          <div className="hardware-label">
            <strong>SKANER KODÓW QR</strong>
            <span>Zbliż telefon z kuponem lub aplikacją</span>
          </div>
        </div>

        {/* Terminal płatniczy z pinpadem */}
        <div
          className={`hardware-unit payment-terminal-unit ${cardInserted ? 'has-card' : ''}`}
          onClick={handleInsertCardTrigger}
          title="Fizyczny terminal płatniczy (kliknij aby zbliżyć kartę/telefon)"
          data-aoi="AOI_cel"
        >
          <div className="terminal-display">
            <div className="terminal-screen-text">
              {currentScreen === 'payment-processing' ? 'ZBILIŻ KARTĘ LUB BLIK' : 'GOTOWY'}
            </div>
            <div className="terminal-nfc-waves">📶</div>
          </div>
          <div className="terminal-pinpad">
            <div className="pinpad-grid">
              <span>1</span><span>2</span><span>3</span>
              <span>4</span><span>5</span><span>6</span>
              <span>7</span><span>8</span><span>9</span>
              <span className="pin-cancel">✕</span><span>0</span><span className="pin-ok">✓</span>
            </div>
          </div>
          <div className="card-slot">
            <span className="slot-indicator">▼ CZYTNIK KART CHIP ▼</span>
            {cardInserted && <div className="simulated-payment-card">KARTA VISA / MC</div>}
          </div>
        </div>

        {/* Drukarka paragonów */}
        <div className="hardware-unit receipt-printer-bay">
          <div className="printer-slot">
            <div className="slot-opening"></div>
            {receiptPrinted && (
              <div
                className="printed-receipt-paper animated-eject"
                onClick={handleTakeReceipt}
                title="Kliknij, aby odebrać wydrukowany paragon"
              >
                <div className="receipt-header">*** PARAGON FISKALNY ***</div>
                <div className="receipt-number">ZAMÓWIENIE #{orderNumber}</div>
                <div className="receipt-footer">DZIĘKUJEMY I ZAPRASZAMY!</div>
                <div className="receipt-take-hint">Kliknij, aby odebrać</div>
              </div>
            )}
          </div>
          <div className="hardware-label">
            <strong>DRUKARKA PARAGONÓW</strong>
            <span>Odbierz paragon po zatwierdzeniu transakcji</span>
          </div>
        </div>
      </div>
    </div>
  );
};
