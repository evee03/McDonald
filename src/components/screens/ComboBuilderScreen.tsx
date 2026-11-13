import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { frySauces, comboDrinks, comboExtras } from '../../data/products';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const ComboBuilderScreen: React.FC = () => {
  const t = useT();
  const {
    tempCombo,
    comboStep,
    setComboStep,
    setComboSize,
    setComboSide,
    setComboSauce,
    setComboDrink,
    setComboExtra,
    finishComboBuilder,
    navigateTo,
    openPersonalize,
  } = useKioskStore();

  const [drinkCategory, setDrinkCategory] = useState<'all' | 'cold' | 'water' | 'hot'>('all');

  if (!tempCombo) {
    navigateTo('menu');
    return null;
  }

  // Obliczenie bieżącej ceny zestawu
  let currentPrice = tempCombo.baseProduct.price + 12.80;
  if (tempCombo.size === 'large') currentPrice += 3.00;
  if (tempCombo.sauce.priceAdd) currentPrice += tempCombo.sauce.priceAdd;
  if (tempCombo.drink.priceAdd) currentPrice += tempCombo.drink.priceAdd;
  if (tempCombo.extra?.priceAdd) currentPrice += tempCombo.extra.priceAdd;

  const handleStepClick = (stepIndex: number, label: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Przejście do kroku zestawu: ${label}`, e, 'combo-builder');
    setComboStep(stepIndex);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Kolejny krok (${comboStep} -> ${comboStep + 1})`, e, 'combo-builder');
    setComboStep(Math.min(6, comboStep + 1));
  };

  const handleFinish = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Zakończ konfigurację i dodaj Zestaw do zamówienia', e, 'combo-builder');
    finishComboBuilder();
  };

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Anuluj konfigurator zestawu', e, 'combo-builder');
    navigateTo('menu', 'AOI_wstecz', 'Powrót do menu');
  };

  // Filtrowanie napojów
  const filteredDrinks = comboDrinks.filter((d) => {
    if (drinkCategory === 'cold') return ['cola', 'cola-zero', 'sprite', 'fanta', 'ice-tea', 'sprite-sakura'].includes(d.id);
    if (drinkCategory === 'water') return d.id.includes('water');
    if (drinkCategory === 'hot') return ['latte', 'cappuccino', 'flat-white'].includes(d.id);
    return true;
  });

  return (
    <div className="kiosk-page-view combo-builder-page">
      {/* Górny pasek nagłówka */}
      <header className="combo-top-header">
        <div className="combo-header-brand">
          <span className="brand-letter-m">M</span>
          <div className="combo-title-stack">
            <h1 className="combo-name-heading">{t(tempCombo.baseProduct.name)} {t('Zestaw')}</h1>
            <span className="combo-total-price-tag">{currentPrice.toFixed(2)} zł</span>
          </div>
        </div>

        <button
          type="button"
          className="combo-nutrition-link"
          onClick={() => navigateTo('allergens', 'AOI_cel', 'Wartości odżywcze')}
          data-aoi="AOI_cel"
        >
          {t('Wartości odżywcze i składniki')}
        </button>
      </header>

      {/* Główny obszar z lewym stepperem i prawą zawartością */}
      <div className="combo-builder-main-split">
        {/* Lewy stepper kroków */}
        <aside className="combo-stepper-nav" aria-label="Kroki konfiguratora zestawu">
          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 1 ? 'active' : ''} ${comboStep > 1 ? 'done' : ''}`}
            onClick={(e) => handleStepClick(1, 'Rozmiar zestawu', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">{comboStep > 1 ? '✓' : '1'}</span>
            <div className="step-text-wrap">
              <strong>{t('Zestaw')}</strong>
              <span>{t(tempCombo.size === 'large' ? 'Powiększony' : 'Standardowy')}</span>
            </div>
          </button>

          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 2 ? 'active' : ''} ${comboStep > 2 ? 'done' : ''}`}
            onClick={(e) => handleStepClick(2, 'Wybierz dodatek', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">{comboStep > 2 ? '✓' : '2'}</span>
            <div className="step-text-wrap">
              <strong>{t('Wybierz dodatek')}</strong>
              <span>{t(tempCombo.side === 'frytki' ? 'Frytki' : 'Sałatka')}</span>
            </div>
          </button>

          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 3 ? 'active' : ''} ${comboStep > 3 ? 'done' : ''}`}
            onClick={(e) => handleStepClick(3, 'Dodatek do frytek', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">{comboStep > 3 ? '✓' : '3'}</span>
            <div className="step-text-wrap">
              <strong>{t('Dodatek do frytek')}</strong>
              <span>{t(tempCombo.sauce.name)}</span>
            </div>
          </button>

          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 4 ? 'active' : ''} ${comboStep > 4 ? 'done' : ''}`}
            onClick={(e) => handleStepClick(4, 'Wybierz napój', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">{comboStep > 4 ? '✓' : '4'}</span>
            <div className="step-text-wrap">
              <strong>{t('Wybierz napój')}</strong>
              <span>{t(tempCombo.drink.name)}</span>
            </div>
          </button>

          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 5 ? 'active' : ''} ${comboStep > 5 ? 'done' : ''}`}
            onClick={(e) => handleStepClick(5, 'Extra dodatek', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">{comboStep > 5 ? '✓' : '5'}</span>
            <div className="step-text-wrap">
              <strong>{t('Extra dodatek')}</strong>
              <span>{tempCombo.extra ? t(tempCombo.extra.name) : t('Brak')}</span>
            </div>
          </button>

          <button
            type="button"
            className={`combo-stepper-btn ${comboStep === 6 ? 'active' : ''}`}
            onClick={(e) => handleStepClick(6, 'Twój wybór', e)}
            data-aoi="AOI_cel"
          >
            <span className="step-circle">6</span>
            <div className="step-text-wrap">
              <strong>{t('Twój wybór')}</strong>
              <span>{t('Podsumowanie')}</span>
            </div>
          </button>
        </aside>

        {/* Prawa zawartość w zależności od comboStep */}
        <main className="combo-step-content-area">
          {/* KROK 1: Rozmiar zestawu */}
          {comboStep === 1 && (
            <div className="step-view-block">
              <h2 className="step-heading-text">{t('Wybierz rozmiar zestawu:')}</h2>
              <div className="combo-cards-2col">
                <div
                  className={`combo-choice-box ${tempCombo.size === 'standard' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór: Zestaw Standardowy', e, 'combo-builder');
                    setComboSize('standard');
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="meal" label="Zestaw standardowy" /></div>
                  <strong className="choice-name">{t('Zestaw Standardowy')}</strong>
                  <div className="choice-price">{(tempCombo.baseProduct.price + 12.80).toFixed(2)} zł</div>
                </div>

                <div
                  className={`combo-choice-box ${tempCombo.size === 'large' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór: Zestaw Powiększony (+3,00 zł)', e, 'combo-builder');
                    setComboSize('large');
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="meal" label="Zestaw powiększony" /></div>
                  <strong className="choice-name">{t('Zestaw Powiększony')}</strong>
                  <div className="choice-price">{(tempCombo.baseProduct.price + 12.80 + 3.00).toFixed(2)} zł</div>
                </div>
              </div>
            </div>
          )}

          {/* KROK 2: Dodatek do zestawu */}
          {comboStep === 2 && (
            <div className="step-view-block">
              <h2 className="step-heading-text">{t('Wybierz dodatek do zestawu:')}</h2>
              <div className="combo-cards-2col">
                <div
                  className={`combo-choice-box ${tempCombo.side === 'frytki' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór dodatku: Frytki', e, 'combo-builder');
                    setComboSide('frytki');
                  }}
                  data-aoi="AOI_cel"
                >
                  <div className="choice-visual"><VisualIcon kind="fries" label="Frytki" /></div>
                  <strong className="choice-name">{t('Frytki')}</strong>
                  <span className="choice-subtext">{t('Chrupiące złociste frytki')}</span>
                </div>

                <div
                  className={`combo-choice-box ${tempCombo.side === 'salatka' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór dodatku: Sałatka', e, 'combo-builder');
                    setComboSide('salatka');
                  }}
                  data-aoi="AOI_cel"
                >
                  <div className="choice-visual"><VisualIcon kind="category" label="Sałatka" /></div>
                  <strong className="choice-name">{t('Sałatka')}</strong>
                  <span className="choice-subtext">{t('Świeża sałata z pomidorkami')}</span>
                </div>
              </div>
            </div>
          )}

          {/* KROK 3: Dodatek do frytek (sosy) */}
          {comboStep === 3 && (
            <div className="step-view-block">
              <h2 className="step-heading-text">{t('Wybierz sos do dodatku:')}</h2>
              <div className="sauces-grid-layout">
                {frySauces.map((sauce) => (
                  <div
                    key={sauce.id}
                    className={`sauce-tile-box ${tempCombo.sauce.id === sauce.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      eventLogger.logTouch('AOI_cel', `Wybór sosu: ${sauce.name}`, e, 'combo-builder');
                      setComboSauce(sauce);
                    }}
                    data-aoi="AOI_cel"
                  >
                    <div className="sauce-icon-wrap"><VisualIcon kind="category" label={sauce.name} /></div>
                    <div className="sauce-name-text">{t(sauce.name)}</div>
                    {sauce.priceAdd > 0 ? (
                      <div className="sauce-price-text">+{sauce.priceAdd.toFixed(2)} zł</div>
                    ) : (
                      <div className="sauce-price-free">{t('W cenie')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KROK 4: Wybór napoju */}
          {comboStep === 4 && (
            <div className="step-view-block">
              <h2 className="step-heading-text">{t('Wybierz napój:')}</h2>

              {/* Filtry napojów */}
              <div className="drinks-filter-tabs">
                <button
                  type="button"
                  className={`drink-filter-btn ${drinkCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setDrinkCategory('all')}
                  data-aoi="AOI_cel"
                >
                  {t('Wszystkie')}
                </button>
                <button
                  type="button"
                  className={`drink-filter-btn ${drinkCategory === 'cold' ? 'active' : ''}`}
                  onClick={() => setDrinkCategory('cold')}
                  data-aoi="AOI_cel"
                >
                  {t('Napoje zimne')}
                </button>
                <button
                  type="button"
                  className={`drink-filter-btn ${drinkCategory === 'water' ? 'active' : ''}`}
                  onClick={() => setDrinkCategory('water')}
                  data-aoi="AOI_cel"
                >
                  {t('Woda')}
                </button>
                <button
                  type="button"
                  className={`drink-filter-btn ${drinkCategory === 'hot' ? 'active' : ''}`}
                  onClick={() => setDrinkCategory('hot')}
                  data-aoi="AOI_cel"
                >
                  {t('Napoje gorące')}
                </button>
              </div>

              <div className="drinks-grid-layout">
                {filteredDrinks.map((drink) => (
                  <div
                    key={drink.id}
                    className={`drink-tile-box ${tempCombo.drink.id === drink.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      eventLogger.logTouch('AOI_cel', `Wybór napoju: ${drink.name}`, e, 'combo-builder');
                      setComboDrink(drink);
                    }}
                    data-aoi="AOI_cel"
                  >
                    <div className="drink-icon-wrap"><VisualIcon kind={drink.image} label={drink.name} photoKey={drink.id} /></div>
                    <div className="drink-name-text">{t(drink.name)}</div>
                    {drink.priceAdd > 0 ? (
                      <div className="drink-price-add">+{drink.priceAdd.toFixed(2)} zł</div>
                    ) : (
                      <div className="drink-price-free">{t('W cenie')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KROK 5: Extra dodatek */}
          {comboStep === 5 && (
            <div className="step-view-block">
              <h2 className="step-heading-text">{t('Wybierz extra dodatek do zestawu:')}</h2>
              <div className="combo-cards-2col">
                <div
                  className={`combo-choice-box ${tempCombo.extra?.id === 'sundae-caramel' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór extra dodatku: Lody', e, 'combo-builder');
                    setComboExtra(comboExtras[0]);
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="drink" label="Deser" /></div>
                  <strong className="choice-name">{t('Lody Karmelowe')}</strong>
                  <div className="choice-price">+0.90 zł</div>
                </div>

                <div
                  className={`combo-choice-box ${!tempCombo.extra ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Brak extra dodatku (Nie, dziękuję)', e, 'combo-builder');
                    setComboExtra(undefined);
                  }}
                  data-aoi="AOI_cel"
                >
                  <div className="choice-visual">—</div>
                  <strong className="choice-name">{t('Nie, dziękuję')}</strong>
                  <span className="choice-subtext">{t('Bez dodatkowego deseru')}</span>
                </div>
              </div>
            </div>
          )}

          {/* KROK 6: Twój wybór (Podsumowanie zestawu) */}
          {comboStep === 6 && (
            <div className="step-view-block combo-summary-view">
              <h2 className="step-heading-text">{t('Twój wybór:')}</h2>

              <div className="combo-elements-horizontal-row">
                {/* Element 1: Burger */}
                <div className="summary-item-card">
                  <div className="summary-card-visual"><VisualIcon kind={tempCombo.baseProduct.image} label={tempCombo.baseProduct.name} photoKey={tempCombo.baseProduct.id} /></div>
                  <div className="summary-card-name">{t(tempCombo.baseProduct.name)}</div>
                  <button
                    type="button"
                    className="btn-summary-personalize"
                    onClick={() => openPersonalize(tempCombo.baseProduct)}
                    data-aoi="AOI_cel"
                  >
                    {t('Personalizuj')}
                  </button>
                </div>

                {/* Element 2: Dodatek */}
                <div className="summary-item-card">
                  <div className="summary-card-visual">
                    <VisualIcon kind={tempCombo.side === 'frytki' ? 'fries' : 'category'} label={tempCombo.side} />
                  </div>
                  <div className="summary-card-name">
                    {t(tempCombo.side === 'frytki' ? 'Frytki' : 'Sałatka')}
                  </div>
                  <button
                    type="button"
                    className="btn-summary-change"
                    onClick={(e) => handleStepClick(2, 'Zmień dodatek', e)}
                    data-aoi="AOI_cel"
                  >
                    {t('Zmień')}
                  </button>
                </div>

                {/* Element 3: Sos */}
                <div className="summary-item-card">
                  <div className="summary-card-visual"><VisualIcon kind="category" label={tempCombo.sauce.name} /></div>
                  <div className="summary-card-name">{t(tempCombo.sauce.name)}</div>
                  <button
                    type="button"
                    className="btn-summary-change"
                    onClick={(e) => handleStepClick(3, 'Zmień sos', e)}
                    data-aoi="AOI_cel"
                  >
                    {t('Zmień')}
                  </button>
                </div>

                {/* Element 4: Napój */}
                <div className="summary-item-card">
                  <div className="summary-card-visual"><VisualIcon kind={tempCombo.drink.image} label={tempCombo.drink.name} photoKey={tempCombo.drink.id} /></div>
                  <div className="summary-card-name">{t(tempCombo.drink.name)}</div>
                  <button
                    type="button"
                    className="btn-summary-change"
                    onClick={(e) => handleStepClick(4, 'Zmień napój', e)}
                    data-aoi="AOI_cel"
                  >
                    {t('Zmień')}
                  </button>
                </div>

                {/* Element 5: Extra */}
                {tempCombo.extra && (
                  <div className="summary-item-card">
                    <div className="summary-card-visual"><VisualIcon kind="category" label={tempCombo.extra.name} /></div>
                    <div className="summary-card-name">{t(tempCombo.extra.name)}</div>
                    <button
                      type="button"
                      className="btn-summary-change"
                      onClick={(e) => handleStepClick(5, 'Zmień extra dodatek', e)}
                      data-aoi="AOI_cel"
                    >
                      {t('Zmień')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Przyciski kontrolne na dole kroku */}
          <div className="combo-builder-bottom-controls">
            <button
              type="button"
              className="btn-combo-cancel"
              onClick={handleCancel}
              data-aoi="AOI_wstecz"
            >
              {t('Anuluj')}
            </button>

            {comboStep < 6 ? (
              <button
                type="button"
                className="btn-combo-next"
                onClick={handleNextStep}
                data-aoi="AOI_cel"
              >
                {t('Dalej →')}
              </button>
            ) : (
              <button
                type="button"
                className="btn-combo-add-final"
                onClick={handleFinish}
                data-aoi="AOI_cel"
              >
                {t('Dodaj do zamówienia')} ({currentPrice.toFixed(2)} zł)
              </button>
            )}
          </div>
        </main>
      </div>

      <BottomBar />
    </div>
  );
};
