import React, { useEffect, useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

export const DineOptionChangeModal: React.FC = () => {
  const t = useT();
  const { activeModal, closeModal, dineOption, setDineOption, currentScreen } = useKioskStore();

  const currentOption = dineOption || 'na-miejscu';
  // Domyślnie zaznaczona jest AKTUALNIE wybrana opcja, aby nie mylić użytkownika
  const [selectedOption, setSelectedOption] = useState<'na-miejscu' | 'na-wynos'>(currentOption);

  useEffect(() => {
    if (activeModal === 'dine-option-change') {
      setSelectedOption(dineOption || 'na-miejscu');
    }
  }, [activeModal, dineOption]);

  if (activeModal !== 'dine-option-change') return null;

  const targetOptionLabel = selectedOption === 'na-miejscu' ? t('Na Miejscu') : t('Na Wynos');
  const hasChanged = selectedOption !== currentOption;

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Anuluj zmianę formy zamówienia', e, currentScreen);
    closeModal('AOI_wstecz');
  };

  const handleConfirm = (e: React.MouseEvent) => {
    if (hasChanged) {
      eventLogger.logTouch('AOI_cel', `Potwierdź zmianę formy zamówienia na: ${targetOptionLabel}`, e, currentScreen);
      setDineOption(selectedOption);
    } else {
      eventLogger.logTouch('AOI_cel', 'Zamknięcie okna bez zmiany formy zamówienia', e, currentScreen);
    }
    closeModal('AOI_cel');
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleCancel}>
      <div
        className="kiosk-restart-dialog dine-change-dialog"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <div className="error-icon-speech-bubble">
          <span className="exclamation-symbol">!</span>
        </div>

        <h2 className="restart-dialog-title">{t('Zmiana formy zamówienia')}</h2>
        <p className="restart-dialog-subtitle">
          {hasChanged
            ? `${t('Czy na pewno chcesz zmienić formę zamówienia na')} ${targetOptionLabel}? ${t('Wszystkie wybrane produkty zostaną zachowane.')}`
            : t('Wybierz formę zamówienia, na którą chcesz zmienić. Wszystkie wybrane produkty zostaną zachowane.')}
        </p>

        <div className="dine-change-cards-row">
          <button
            type="button"
            className={`dine-change-card ${selectedOption === 'na-miejscu' ? 'active' : ''} ${currentOption === 'na-miejscu' ? 'is-current' : ''}`}
            onClick={(e) => {
              eventLogger.logTouch('AOI_cel', 'Wybór w oknie dialogowym: Na Miejscu', e, currentScreen);
              setSelectedOption('na-miejscu');
            }}
            data-aoi="AOI_cel"
          >
            <span className="dine-change-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2v20" />
                <path d="M21 7V2h-6v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3Z" />
                <path d="M3 2v6a3 3 0 0 0 3 3v11" />
                <path d="M3 2v5" />
                <path d="M6 2v5" />
              </svg>
            </span>
            <div className="dine-change-card-info">
              <span className="dine-change-card-title">{t('Na Miejscu')}</span>
              {currentOption === 'na-miejscu' && (
                <span className="dine-change-current-tag">{t('Aktualnie')}</span>
              )}
            </div>
            {selectedOption === 'na-miejscu' && (
              <span className="dine-change-check" aria-hidden="true">✓</span>
            )}
          </button>

          <button
            type="button"
            className={`dine-change-card ${selectedOption === 'na-wynos' ? 'active' : ''} ${currentOption === 'na-wynos' ? 'is-current' : ''}`}
            onClick={(e) => {
              eventLogger.logTouch('AOI_cel', 'Wybór w oknie dialogowym: Na Wynos', e, currentScreen);
              setSelectedOption('na-wynos');
            }}
            data-aoi="AOI_cel"
          >
            <span className="dine-change-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <div className="dine-change-card-info">
              <span className="dine-change-card-title">{t('Na Wynos')}</span>
              {currentOption === 'na-wynos' && (
                <span className="dine-change-current-tag">{t('Aktualnie')}</span>
              )}
            </div>
            {selectedOption === 'na-wynos' && (
              <span className="dine-change-check" aria-hidden="true">✓</span>
            )}
          </button>
        </div>

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
            {hasChanged ? t('Potwierdź zmianę') : t('Potwierdź')}
          </button>
        </div>
      </div>
    </div>
  );
};
