import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

const DineChoicePhoto: React.FC<{ type: 'dine-in' | 'takeaway' }> = ({ type }) => {
  const isTakeaway = type === 'takeaway';

  return (
    <div className={`dine-choice-photo-wrap ${isTakeaway ? 'takeaway' : 'dine-in'}`}>
      <VisualIcon kind={isTakeaway ? 'bag' : 'burger'} label={isTakeaway ? 'Na wynos' : 'Na miejscu'} />
    </div>
  );
};

export const DineChoiceScreen: React.FC = () => {
  const { setDineOption, setLanguage, currentLanguage, navigateTo } = useKioskStore();
  const t = useT();

  const handleSelectDineIn = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Wybór opcji: Na Miejscu', e, 'dine-choice');
    setDineOption('na-miejscu');
    navigateTo('menu', 'AOI_cel', 'Przejście do menu');
  };

  const handleSelectTakeaway = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Wybór opcji: Na Wynos', e, 'dine-choice');
    setDineOption('na-wynos');
    navigateTo('menu', 'AOI_cel', 'Przejście do menu');
  };

  const handleLanguageChange = (lang: 'pl' | 'en' | 'de' | 'ua', label: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Zmiana języka na: ${label}`, e, 'dine-choice');
    setLanguage(lang);
  };

  return (
    <div className="kiosk-page-view dine-choice-page">
      <div className="dine-choice-header">
        <div className="kiosk-neutral-logo">M</div>
      </div>

      <main className="dine-choice-body">
        <h1 className="dine-choice-title">{t('Na miejscu czy na wynos?')}</h1>

        <div className="dine-options-grid">
          {/* Opcja 1: Na Miejscu */}
          <div
            className="dine-card-choice"
            onClick={handleSelectDineIn}
            data-aoi="AOI_cel"
          >
            <DineChoicePhoto type="dine-in" />
            <h2 className="dine-card-label">{t('Na Miejscu')}</h2>
          </div>

          {/* Opcja 2: Na Wynos */}
          <div
            className="dine-card-choice"
            onClick={handleSelectTakeaway}
            data-aoi="AOI_cel"
          >
            <DineChoicePhoto type="takeaway" />
            <h2 className="dine-card-label">{t('Na Wynos')}</h2>
          </div>
        </div>

        {/* Sekcja wyboru języków */}
        <div className="language-selector-section">
          <div className="lang-section-label">
            <span className="lang-icon-small">PL</span>
            <span>{t('Dostępne Języki')}</span>
          </div>

          <div className="languages-pill-row">
            <button
              type="button"
              className={`lang-pill-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
              onClick={(e) => handleLanguageChange('pl', 'Polski', e)}
              data-aoi="AOI_cel"
            >
              {t('Polski')} {currentLanguage === 'pl' && <span className="pill-check" aria-hidden="true">✓</span>}
            </button>

            <button
              type="button"
              className={`lang-pill-btn ${currentLanguage === 'en' ? 'active' : ''}`}
              onClick={(e) => handleLanguageChange('en', 'English', e)}
              data-aoi="AOI_cel"
            >
              {t('English')} {currentLanguage === 'en' && <span className="pill-check" aria-hidden="true">✓</span>}
            </button>

            <button
              type="button"
              className={`lang-pill-btn ${currentLanguage === 'de' ? 'active' : ''}`}
              onClick={(e) => handleLanguageChange('de', 'Deutsch', e)}
              data-aoi="AOI_cel"
            >
              {t('Deutsch')} {currentLanguage === 'de' && <span className="pill-check" aria-hidden="true">✓</span>}
            </button>
          </div>

          <button
            type="button"
            className="btn-more-languages"
            onClick={(e) => {
              eventLogger.logTouch('AOI_cel', 'Otwarcie ekranu dostępnych języków', e, 'dine-choice');
              navigateTo('language-select', 'AOI_cel', 'Dostępne języki');
            }}
            data-aoi="AOI_cel"
          >
            {t('Dostępne języki')}
          </button>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};
