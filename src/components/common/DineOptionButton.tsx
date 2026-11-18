import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

interface DineOptionButtonProps {
  className?: string;
  sourceScreen?: string;
}

export const DineOptionButton: React.FC<DineOptionButtonProps> = ({
  className = '',
  sourceScreen = 'menu',
}) => {
  const { dineOption, interfaceVersion, openModal } = useKioskStore();
  const t = useT();

  if (interfaceVersion !== 'B') return null;

  const currentOption = dineOption || 'na-miejscu';
  const isDineIn = currentOption === 'na-miejscu';

  return (
    <button
      type="button"
      className={`dine-option-indicator ${isDineIn ? 'dine-in' : 'takeaway'} ${className}`}
      onClick={(e) => {
        eventLogger.logTouch('AOI_cel', `Kliknięcie wskaźnika formy zamówienia: ${currentOption}`, e, sourceScreen);
        openModal('dine-option-change');
      }}
      data-aoi="AOI_cel"
      title={t('Zmień formę zamówienia')}
      aria-label={`${t('Forma zamówienia')}: ${isDineIn ? t('Na Miejscu') : t('Na Wynos')}. ${t('Kliknij, aby zmienić.')}`}
    >
      <span className="dine-indicator-icon" aria-hidden="true">
        {isDineIn ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2v20" />
            <path d="M21 7V2h-6v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3Z" />
            <path d="M3 2v6a3 3 0 0 0 3 3v11" />
            <path d="M3 2v5" />
            <path d="M6 2v5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )}
      </span>
      <span className="dine-indicator-label">
        {isDineIn ? t('Na Miejscu') : t('Na Wynos')}
      </span>
      <span className="dine-indicator-change" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>
  );
};
