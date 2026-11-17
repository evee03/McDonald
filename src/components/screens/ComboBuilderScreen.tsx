import React, { useEffect, useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { getComboProductLabel, frySauces, comboDrinks, comboExtras } from '../../data/products';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { useT } from '../../i18n';
import { formatPrice } from '../../utils/formatPrice';
import { DineOptionButton } from '../common/DineOptionButton';
import { AllergensScrollbar } from '../common/AllergensScrollbar';

export const ComboBuilderScreen: React.FC = () => {
  const t = useT();
  const {
    tempCombo,
    comboStep,
    selectedCartItemId,
    pendingComboQuantity,
    cart,
    setComboStep,
    setComboSize,
    setComboSide,
    setComboSauce,
    setComboDrink,
    setComboExtra,
    finishComboBuilder,
    navigateTo,
    cancelComboBuilder,
    openPersonalize,
  } = useKioskStore();

  const [drinkCategory, setDrinkCategory] = useState<'all' | 'cold' | 'water' | 'hot'>('all');
  const [comboQuantity, setComboQuantity] = useState(1);
  const isEditingCombo = Boolean(selectedCartItemId);
  const comboTitle = t(getComboProductLabel(tempCombo?.baseProduct.name || ''));

  useEffect(() => {
    const existingItem = selectedCartItemId
      ? cart.find((item) => item.id === selectedCartItemId)
      : undefined;
    setComboQuantity(existingItem?.quantity ?? pendingComboQuantity);
  }, [cart, pendingComboQuantity, selectedCartItemId]);

  if (!tempCombo) {
    navigateTo('menu');
    return null;
  }

  // Obliczenie bieżącej ceny zestawu
  let currentPrice = tempCombo.baseProduct.price + 12.80;
  if (tempCombo.size === 'large') currentPrice += 3.00;
  if (tempCombo.sauce?.priceAdd) currentPrice += tempCombo.sauce.priceAdd;
  if (tempCombo.drink?.priceAdd) currentPrice += tempCombo.drink.priceAdd;
  if (tempCombo.extra?.priceAdd) currentPrice += tempCombo.extra.priceAdd;
  const isComboComplete = Boolean(tempCombo.size && tempCombo.side && tempCombo.sauce && tempCombo.drink && tempCombo.extra);

  const handleStepClick = (stepIndex: number, label: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Przejście do kroku zestawu: ${label}`, e, 'combo-builder');
    setComboStep(stepIndex);
  };

  const handleFinish = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Zakończ konfigurację i dodaj Zestaw do zamówienia', e, 'combo-builder');
    finishComboBuilder(comboQuantity);
  };

  const handleRemoveProduct = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Usuń produkt z zamówienia', e, 'combo-builder');
    cancelComboBuilder(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    eventLogger.logTouch(
      'AOI_wstecz',
      isEditingCombo
        ? 'Anuluj edycję zestawu'
        : comboStep > 1
          ? `Anuluj krok zestawu (${comboStep} -> ${comboStep - 1})`
          : 'Anuluj konfigurację zestawu',
      e,
      'combo-builder'
    );
    if (isEditingCombo) {
      cancelComboBuilder(false);
    } else if (comboStep > 1) {
      setComboStep(comboStep - 1);
    } else {
      cancelComboBuilder(false);
    }
  };

  // Filtrowanie napojów
  const filteredDrinks = comboDrinks.filter((d) => {
    if (drinkCategory === 'cold') return ['cola', 'cola-zero', 'sprite', 'fanta', 'ice-tea', 'sprite-sakura'].includes(d.id);
    if (drinkCategory === 'water') return d.id.includes('water');
    if (drinkCategory === 'hot') return ['latte', 'cappuccino', 'flat-white'].includes(d.id);
    return true;
  });

  return (
    <div className={`kiosk-page-view combo-builder-page ${comboStep === 6 ? 'combo-builder-summary-page' : ''}`}>
      {/* Górny pasek nagłówka */}
      <header className="combo-top-header">
        <div className="combo-header-brand">
          <span className="brand-letter-m">M</span>
          {comboStep !== 6 && (
            <div className="combo-title-stack">
              <h1 className="combo-name-heading">{comboTitle}</h1>
              <span className="combo-total-price-tag">{formatPrice(currentPrice)} zł</span>
            </div>
          )}
          {comboStep === 6 && (
            <button
              type="button"
              className="combo-nutrition-link"
              onClick={() => navigateTo('allergens', 'AOI_cel', 'Wartości odżywcze')}
              data-aoi="AOI_cel"
            >
              {t('Wartości odżywcze i składniki')}
            </button>
          )}
        </div>
        <div className="combo-header-right-actions">
          <DineOptionButton sourceScreen="combo-builder" />
          {comboStep !== 6 && (
            <button
              type="button"
              className="combo-nutrition-link"
              onClick={() => navigateTo('allergens', 'AOI_cel', 'Wartości odżywcze')}
              data-aoi="AOI_cel"
            >
              {t('Wartości odżywcze i składniki')}
            </button>
          )}
        </div>
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
              <span>{tempCombo.size ? t(tempCombo.size === 'large' ? 'Powiększony' : 'Standardowy') : 'Wybierz rozmiar'}</span>
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
              <span>{tempCombo.side ? t(tempCombo.side === 'frytki' ? 'Frytki' : 'Sałatka') : 'Nie wybrano'}</span>
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
              <span>{tempCombo.sauce ? t(tempCombo.sauce.name) : 'Nie wybrano'}</span>
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
              <span>{tempCombo.drink ? t(tempCombo.drink.name) : 'Nie wybrano'}</span>
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
                    setComboStep(2);
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="meal" label="Zestaw standardowy" /></div>
                  <strong className="choice-name">{t('Zestaw Standardowy')}</strong>
                  <div className="choice-price">{formatPrice(tempCombo.baseProduct.price + 12.80)} zł</div>
                </div>

                <div
                  className={`combo-choice-box ${tempCombo.size === 'large' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Wybór: Zestaw Powiększony (+3,00 zł)', e, 'combo-builder');
                    setComboSize('large');
                    setComboStep(2);
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="meal" label="Zestaw powiększony" /></div>
                  <strong className="choice-name">{t('Zestaw Powiększony')}</strong>
                  <div className="choice-price">{formatPrice(tempCombo.baseProduct.price + 12.80 + 3.00)} zł</div>
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
                    setComboStep(3);
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
                    setComboStep(3);
                  }}
                  data-aoi="AOI_cel"
                >
                  <div className="choice-visual"><IngredientIcon id="salad" label="Sałatka" /></div>
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
              <AllergensScrollbar className="combo-choice-scroll-shell" contentClassName="combo-choice-scroll-body">
              <div className="sauces-grid-layout">
                {frySauces.map((sauce) => (
                  <div
                    key={sauce.id}
                    className={`sauce-tile-box ${tempCombo.sauce?.id === sauce.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      eventLogger.logTouch('AOI_cel', `Wybór sosu: ${sauce.name}`, e, 'combo-builder');
                      setComboSauce(sauce);
                      setComboStep(4);
                    }}
                    data-aoi="AOI_cel"
                  >
                    <div className="sauce-icon-wrap"><IngredientIcon id={sauce.id} label={sauce.name} /></div>
                    <div className="sauce-name-text">{t(sauce.name)}</div>
                    {sauce.priceAdd > 0 ? (
                      <div className="sauce-price-text">+{formatPrice(sauce.priceAdd)} zł</div>
                    ) : (
                      <div className="sauce-price-free">{t('W cenie')}</div>
                    )}
                  </div>
                ))}
              </div>
              </AllergensScrollbar>
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

              <AllergensScrollbar className="combo-choice-scroll-shell" contentClassName="combo-choice-scroll-body">
              <div className="drinks-grid-layout">
                {filteredDrinks.map((drink) => (
                  <div
                    key={drink.id}
                    className={`drink-tile-box ${tempCombo.drink?.id === drink.id ? 'selected' : ''}`}
                    onClick={(e) => {
                      eventLogger.logTouch('AOI_cel', `Wybór napoju: ${drink.name}`, e, 'combo-builder');
                      setComboDrink(drink);
                      setComboStep(5);
                    }}
                    data-aoi="AOI_cel"
                  >
                    <div className="drink-icon-wrap"><VisualIcon kind={drink.image} label={drink.name} photoKey={drink.id} /></div>
                    <div className="drink-name-text">{t(drink.name)}</div>
                    {drink.priceAdd > 0 ? (
                      <div className="drink-price-add">+{formatPrice(drink.priceAdd)} zł</div>
                    ) : (
                      <div className="drink-price-free">{t('W cenie')}</div>
                    )}
                  </div>
                ))}
              </div>
              </AllergensScrollbar>
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
                    setComboStep(6);
                  }}
                  data-aoi="AOI_cel"
                >
                  <span className="combo-badge-new">{t('Nowość!')}</span>
                  <div className="choice-visual"><VisualIcon kind="drink" label="Deser" /></div>
                  <strong className="choice-name">{t('Lody Karmelowe')}</strong>
                  <div className="choice-price">+0,90 zł</div>
                </div>

                <div
                  className={`combo-choice-box ${tempCombo.extra?.id === 'no-thanks' ? 'selected' : ''}`}
                  onClick={(e) => {
                    eventLogger.logTouch('AOI_cel', 'Brak extra dodatku (Nie, dziękuję)', e, 'combo-builder');
                    setComboExtra(comboExtras[1]);
                    setComboStep(6);
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
              <div className="combo-summary-heading">
                <h1 className="combo-name-heading">{comboTitle}</h1>
                <span className="combo-total-price-tag">{formatPrice(currentPrice)} zł</span>
              </div>
              <div className="summary-hero-visual" aria-hidden="true">
                {tempCombo.side ? <VisualIcon kind="fries" label="" /> : <span>—</span>}
                <VisualIcon kind={tempCombo.baseProduct.image} label="" photoKey={tempCombo.baseProduct.id} />
                {tempCombo.drink
                  ? <VisualIcon kind={tempCombo.drink.image} label="" photoKey={tempCombo.drink.id} />
                  : <span>—</span>}
              </div>

              <div className="combo-elements-horizontal-row">
                {/* Element 1: Burger */}
                <div className="summary-item-card">
                  <div className="summary-card-visual"><VisualIcon kind={tempCombo.baseProduct.image} label={tempCombo.baseProduct.name} photoKey={tempCombo.baseProduct.id} /></div>
                  <div className="summary-card-name">{t(tempCombo.baseProduct.name)}</div>
                  <button
                    type="button"
                    className="btn-summary-personalize"
                    onClick={() => openPersonalize(tempCombo.baseProduct, selectedCartItemId || undefined)}
                    data-aoi="AOI_cel"
                  >
                    {t('Personalizuj')}
                  </button>
                </div>

                {/* Element 2: Dodatek */}
                <div className="summary-item-card">
                  <div className="summary-card-visual">
                    {tempCombo.side === 'frytki'
                      ? <VisualIcon kind="fries" label="Frytki" />
                      : tempCombo.side === 'salatka'
                        ? <IngredientIcon id="salad" label="Sałatka" />
                        : <span>—</span>}
                  </div>
                  <div className="summary-card-name">
                    {tempCombo.side ? t(tempCombo.side === 'frytki' ? 'Frytki' : 'Sałatka') : 'Nie wybrano'}
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
                  <div className="summary-card-visual">
                    {tempCombo.sauce ? <IngredientIcon id={tempCombo.sauce.id} label={tempCombo.sauce.name} /> : <span>—</span>}
                  </div>
                  <div className="summary-card-name">{tempCombo.sauce ? t(tempCombo.sauce.name) : 'Nie wybrano'}</div>
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
                  <div className="summary-card-visual">
                    {tempCombo.drink
                      ? <VisualIcon kind={tempCombo.drink.image} label={tempCombo.drink.name} photoKey={tempCombo.drink.id} />
                      : <span>—</span>}
                  </div>
                  <div className="summary-card-name">{tempCombo.drink ? t(tempCombo.drink.name) : 'Nie wybrano'}</div>
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
                <div className="summary-item-card">
                  <div className="summary-card-visual">
                    {tempCombo.extra && tempCombo.extra.id !== 'no-thanks'
                      ? <VisualIcon kind="category" label={tempCombo.extra.name} />
                      : <span>—</span>}
                  </div>
                  <div className="summary-card-name">
                    {tempCombo.extra
                      ? t(tempCombo.extra.id === 'no-thanks' ? 'Nie, dziękuję' : tempCombo.extra.name)
                      : 'Nie wybrano'}
                  </div>
                  <button
                    type="button"
                    className="btn-summary-change"
                    onClick={(e) => handleStepClick(5, 'Zmień extra dodatek', e)}
                    data-aoi="AOI_cel"
                  >
                    {t('Zmień')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Przyciski kontrolne na dole kroku */}
          <div className="combo-builder-actions">
            {comboStep === 6 && (
              <div className="combo-quantity-control" aria-label={t('Liczba zestawów')}>
                <div className="combo-quantity-stepper">
                <button
                  type="button"
                  className="btn-secondary-control combo-quantity-button"
                  onClick={() => setComboQuantity((quantity) => Math.max(1, quantity - 1))}
                  disabled={comboQuantity === 1}
                  aria-label={t('Zmniejsz liczbę zestawów')}
                >
                  −
                </button>
                <span className="combo-quantity-value" aria-live="polite">{comboQuantity}</span>
                <button
                  type="button"
                  className="btn-secondary-control combo-quantity-button"
                  onClick={() => setComboQuantity((quantity) => Math.min(9, quantity + 1))}
                  disabled={comboQuantity === 9}
                  aria-label={t('Zwiększ liczbę zestawów')}
                >
                  +
                </button>
                </div>
              </div>
            )}
            <div className="combo-builder-bottom-controls">
            <button
              type="button"
              className={`btn-secondary-control ${comboStep === 6 ? 'btn-combo-cancel' : 'btn-combo-remove'}`}
              onClick={comboStep === 6 ? handleCancel : handleRemoveProduct}
              data-aoi="AOI_wstecz"
            >
              {comboStep === 6 ? t('Anuluj') : t('Usuń produkt')}
            </button>

            {comboStep < 6 ? (
              <button
                type="button"
                className="btn-secondary-control btn-combo-cancel"
                onClick={handleCancel}
                data-aoi="AOI_wstecz"
              >
                {t('Anuluj')}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-control btn-combo-finish"
                onClick={handleFinish}
                disabled={!isComboComplete}
                data-aoi="AOI_cel"
              >
                {isEditingCombo ? t('Zapisz zmiany') : t('Dodaj do zamówienia')}
              </button>
            )}
            </div>
          </div>
        </main>
      </div>

      <BottomBar />
    </div>
  );
};
