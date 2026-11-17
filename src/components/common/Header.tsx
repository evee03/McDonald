import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';
import { DineOptionButton } from './DineOptionButton';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showDineOption?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, rightAction, showDineOption = true }) => {
  const { goBack, interfaceVersion } = useKioskStore();
  const t = useT();

  const handleBack = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Przycisk Wstecz (Header)', e, 'header');
    if (onBack) {
      onBack();
    } else {
      goBack('AOI_wstecz');
    }
  };

  return (
    <header className="kiosk-header">
      <div className="header-left">
        {showBack && (
          <button
            type="button"
            className="header-back-btn"
            onClick={handleBack}
            data-aoi="AOI_wstecz"
          >
            ← {t('Wstecz')}
          </button>
        )}
        <div className="header-logo" title="Logo neutralne">
          <span className="logo-letter">M</span>
        </div>
        {title && <h1 className="header-title">{t(title)}</h1>}
      </div>
      <div className="header-right">
        {rightAction ? (
          <div className="header-actions-group">
            {interfaceVersion === 'B' && showDineOption && <DineOptionButton sourceScreen="header" />}
            {rightAction}
          </div>
        ) : (
          interfaceVersion === 'B' && showDineOption ? <DineOptionButton sourceScreen="header" /> : null
        )}
      </div>
    </header>
  );
};
