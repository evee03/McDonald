import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const WelcomeScreen: React.FC = () => {
  const { navigateTo, toggleAccessibility, isAccessibilityMode } = useKioskStore();
  const t = useT();

  const handleStartOrder = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Kliknij tutaj aby rozpocząć zamówienie', e, 'welcome');
    navigateTo('dine-choice', 'AOI_cel', 'Wybór na miejscu / na wynos');
  };

  const handleAccessibility = (e: React.MouseEvent) => {
    eventLogger.logTouch(
      'AOI_dostepnosc',
      `Przełącznik Dostępność (${isAccessibilityMode ? 'Wyłącz' : 'Włącz'})`,
      e,
      'welcome'
    );
    toggleAccessibility();
  };

  const handleOpenLanguages = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Otwarcie ekranu wyboru języka', e, 'welcome');
    navigateTo('language-select', 'AOI_cel', 'Dostępne języki');
  };

  return (
    <div className="welcome-screen-container">
      <div className="welcome-hero-banner">
        <div className="hero-graphic-center">
          <VisualIcon kind="burger" label="Burger" photoKey="classic-burger" />
        </div>
      </div>

      <div className="welcome-bottom-controls">
        <div className="welcome-main-buttons-row welcome-single-action">
          <button
            type="button"
            className="welcome-card-btn welcome-start-card"
            onClick={handleStartOrder}
            data-aoi="AOI_cel"
          >
            <strong className="start-card-title">{t('Rozpocznij zamówienie')}</strong>
            <span className="start-card-subtitle">{t('Dotknij, aby przejść dalej')}</span>
          </button>
        </div>

        <div className="welcome-footer-row">
          <button
            type="button"
            className={`welcome-a11y-btn ${isAccessibilityMode ? 'active' : ''}`}
            onClick={handleAccessibility}
            data-aoi="AOI_dostepnosc"
            aria-pressed={isAccessibilityMode}
            aria-label={t(isAccessibilityMode ? 'Wyłącz tryb dostępności' : 'Włącz tryb dostępności')}
          >
            <span className="a11y-icon"><VisualIcon kind="accessibility" label="Dostępność" /></span>
            <span className="a11y-text">{t('Dostępność')}</span>
            {isAccessibilityMode && <span className="a11y-enabled-check" aria-hidden="true">✓</span>}
          </button>

          <button
            type="button"
            className="welcome-lang-btn"
            onClick={handleOpenLanguages}
            aria-label={t('Otwórz wybór języka')}
            data-aoi="AOI_cel"
          >
            <span className="welcome-language-code" aria-hidden="true">文</span>
            <span>{t('Języki')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
