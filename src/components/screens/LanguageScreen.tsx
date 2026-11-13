import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { useT } from '../../i18n';

const languages = [
  { id: 'pl', label: 'Polski', nativeLabel: 'Polski' },
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'de', label: 'Deutsch', nativeLabel: 'Deutsch' },
  { id: 'ua', label: 'Українська', nativeLabel: 'Українська' },
] as const;

export const LanguageScreen: React.FC = () => {
  const { currentLanguage, setLanguage, goBack } = useKioskStore();
  const t = useT();

  const handleLanguageSelect = (language: typeof languages[number]['id'], label: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór języka: ${label}`, e, 'language-select');
    setLanguage(language);
  };

  const handleBack = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Powrót z wyboru języka', e, 'language-select');
    goBack('AOI_wstecz');
  };

  return (
    <div className="kiosk-page-view language-select-page">
      <header className="language-screen-header">
        <span className="language-screen-logo" aria-label="McDonald's">M</span>
      </header>

      <main className="language-screen-main">
        <h1 className="language-screen-title">{t('Dostępne Języki')}</h1>
        <div className="language-screen-options">
          {languages.map((language) => (
            <button
              type="button"
              key={language.id}
              className={`language-screen-option ${currentLanguage === language.id ? 'active' : ''}`}
              onClick={(e) => handleLanguageSelect(language.id, language.nativeLabel, e)}
              aria-pressed={currentLanguage === language.id}
              data-aoi="AOI_cel"
            >
              {language.label}
              {currentLanguage === language.id && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </main>

      <footer className="language-screen-footer">
        <button type="button" className="language-screen-back" onClick={handleBack} data-aoi="AOI_wstecz">
          {t('Cofnij')}
        </button>
      </footer>
    </div>
  );
};
