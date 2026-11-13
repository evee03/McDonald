import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';

export const ErrorModal: React.FC = () => {
  const { activeModal, errorMessage, closeModal, currentScreen } = useKioskStore();

  if (activeModal !== 'error') return null;

  const handleDismiss = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_blad', 'Zamknięcie komunikatu błędu (OK)', e, currentScreen);
    closeModal('AOI_blad');
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleDismiss}>
      <div
        className="kiosk-error-dialog"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_blad"
      >
        <div className="error-icon-speech-bubble">
          <span className="exclamation-symbol">!</span>
        </div>

        <h3 className="error-dialog-title">Komunikat</h3>
        <p className="error-dialog-message">{errorMessage || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'}</p>

        <button
          type="button"
          className="btn-error-confirm"
          onClick={handleDismiss}
          data-aoi="AOI_blad"
        >
          OK
        </button>
      </div>
    </div>
  );
};
