import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

export const RestartModal: React.FC = () => {
  const t = useT();
  const { activeModal, closeModal, resetAll, currentScreen } = useKioskStore();

  if (activeModal !== 'restart-confirm') return null;

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Anuluj restart zamówienia', e, currentScreen);
    closeModal('AOI_wstecz');
  };

  const handleConfirm = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Potwierdź restart zamówienia (skasuj)', e, currentScreen);
    resetAll();
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleCancel}>
      <div
        className="kiosk-restart-dialog"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <div className="error-icon-speech-bubble">
          <span className="exclamation-symbol">!</span>
        </div>

        <h2 className="restart-dialog-title">{t('Czy na pewno chcesz zacząć od nowa?')}</h2>
        <p className="restart-dialog-subtitle">
          {t('Wszystkie produkty zostaną usunięte z Twojego zamówienia.')}
        </p>

        <div className="restart-buttons-row">
          <button
            type="button"
            className="btn-restart-cancel"
            onClick={handleCancel}
            data-aoi="AOI_wstecz"
          >
            {t('Anuluj')}
          </button>

          <button
            type="button"
            className="btn-restart-confirm"
            onClick={handleConfirm}
            data-aoi="AOI_cel"
          >
            {t('Potwierdź')}
          </button>
        </div>
      </div>
    </div>
  );
};
