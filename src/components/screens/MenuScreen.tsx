import React, { useState } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { getComboProductLabel, menuCategories, products, type Product } from '../../data/products';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { AllergensScrollbar } from '../common/AllergensScrollbar';
import { useT } from '../../i18n';
import { formatPrice } from '../../utils/formatPrice';

export const MenuScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const t = useT();
  const {
    activeCategory,
    interfaceVersion,
    setActiveCategory,
    openProductDetail,
    startComboBuilder,
  } = useKioskStore();

  const handleCategoryClick = (catId: string, catName: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór kategorii menu: ${catName}`, e, 'menu');
    setActiveCategory(catId);
  };

  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór produktu: ${product.name} (${formatPrice(product.price)} zł)`, e, 'menu');
    if (activeCategory === 'zestawy' && product.canBeCombo) {
      startComboBuilder(product, undefined, 1);
    } else {
      openProductDetail(product);
    }
  };

  const getCategoryIcon = (categoryId: string): string => {
    if (categoryId === 'zestawy') return 'meal';
    if (categoryId === 'burgery') return 'burger';
    if (categoryId === 'frytki') return 'fries';
    if (categoryId === 'napoje' || categoryId === 'kawy') return 'drink';
    return 'category';
  };

  const isVersionB = interfaceVersion === 'B';
  const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const searchResults = searchQuery.trim()
    ? products.filter((product) => normalizeSearch(t(product.name)).includes(normalizeSearch(searchQuery.trim())))
    : [];
  const appendSearchText = (value: string) => setSearchQuery((query) => `${query}${value}`);

  // Filtrowanie produktów
  let filteredProducts: Product[];
  switch (activeCategory) {
    case 'menu-glowne':
      filteredProducts = products;
      break;
    case 'nowosci':
      filteredProducts = products.filter((product) => product.isNew);
      break;
    case 'super-oferta':
      filteredProducts = products.filter((product) => product.isDeal);
      break;
    case 'zestawy':
      filteredProducts = products.filter((product) => product.canBeCombo);
      break;
    case 'wrapy':
      filteredProducts = products.filter((product) => product.category === 'wrapy' || product.id === 'salad-side');
      break;
    default:
      filteredProducts = products.filter((product) => product.category === activeCategory);
  }

  return (
    <div className="kiosk-page-view menu-page" onClick={(event) => {
      if (isKeyboardOpen && !(event.target as HTMLElement).closest('.menu-b-search-sheet, button, input')) setIsKeyboardOpen(false);
    }}>
      <div className="menu-layout-container">
        {/* Wariant A zachowuje nawigację boczną. */}
        {!isVersionB && <aside className="menu-sidebar" aria-label="Kategorie menu">
          <div className="sidebar-brand-logo">
            <span className="brand-letter-m">M</span>
          </div>

          <button
            type="button"
            className={`sidebar-nav-item primary-nav-tile ${activeCategory === 'menu-glowne' ? 'active' : ''}`}
            onClick={(e) => handleCategoryClick('menu-glowne', 'Menu Główne', e)}
            data-aoi="AOI_cel"
          >
            <span className="nav-item-icon"><VisualIcon kind="home" label="Menu główne" /></span>
                  <span className="nav-item-text">{t('Menu Główne')}</span>
          </button>

          <div className="sidebar-categories-scroll">
            {menuCategories
              .filter((c) => c.id !== 'menu-glowne')
              .map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`sidebar-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={(e) => handleCategoryClick(cat.id, cat.name, e)}
                  data-aoi="AOI_cel"
                >
                  <span className="nav-item-icon"><VisualIcon kind={getCategoryIcon(cat.id)} label={cat.name} photoKey={cat.id} /></span>
                  <span className="nav-item-text">{t(cat.name)}</span>
                </button>
              ))}
          </div>
        </aside>}

        {/* Prawy obszar z kafelkami produktów */}
        <main className="menu-main-content">
          {isVersionB && <header className="menu-b-header">
            <div className="menu-b-header-brand">
              <span className="menu-b-logo" aria-label="Logo"><span className="logo-letter">M</span></span>
              <h1>{t('Menu Główne')}</h1>
            </div>
          </header>}
          <AllergensScrollbar className="menu-scroll-shell" contentClassName="menu-scroll-body" contentElement="div">
          {isVersionB && searchQuery.trim() ? (
            <section className="menu-b-search-results">
              <h2 className="hub-section-heading">{t('Wyniki wyszukiwania')}</h2>
              <div className="products-3col-grid">
                {searchResults.length === 0 && <p className="empty-category-message">{t('Nie znaleziono produktu')}</p>}
                {searchResults.map((product) => <div key={product.id} className="product-card-tile" onClick={(e) => handleProductClick(product, e)} data-aoi="AOI_cel">
                  <div className="card-visual-wrapper"><VisualIcon label={product.name} kind={product.image} photoKey={product.id} /></div>
                  <div className="card-title-text">{t(product.name)}</div>
                  <div className="card-price-value">{formatPrice(product.price)} zł</div>
                </div>)}
              </div>
            </section>
          ) : activeCategory === 'menu-glowne' ? (
            /* WIDOK GŁÓWNY: Kafelki sekcji + Nowości */
            <div className="menu-hub-view">
              <section className="hub-top-section">
                {!isVersionB && <h2 className="hub-section-heading">{t('Sprawdź nasze menu')}</h2>}
                {isVersionB && <section className="menu-b-group menu-b-new-group">
                  <h2 className="hub-section-heading">{t('Wybrane dla Ciebie')}</h2>
                  <div className="menu-b-new-grid">
                    {(['nowosci', 'super-oferta'] as const).map((categoryId) => {
                      const category = menuCategories.find((item) => item.id === categoryId)!;
                      return <button type="button" key={categoryId} className="hub-big-tile menu-b-category-tile" onClick={(e) => handleCategoryClick(categoryId, category.name, e)} data-aoi="AOI_cel">
                        <span className="hub-tile-visual"><VisualIcon kind={categoryId === 'nowosci' ? 'burger' : 'fries'} label={category.name} photoKey={categoryId} /></span>
                        <strong className="hub-tile-title">{t(category.name)}</strong>
                      </button>;
                    })}
                  </div>
                </section>}
                <div className={isVersionB ? 'menu-b-group menu-b-categories-group' : undefined}>
                  {isVersionB && <h2 className="hub-section-heading">{t('Kategorie')}</h2>}
                <div className="hub-featured-grid menu-b-category-grid">
                  {menuCategories.filter((cat) => cat.id !== 'menu-glowne' && (!isVersionB || !['nowosci', 'super-oferta'].includes(cat.id))).map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      className="hub-big-tile menu-b-category-tile"
                      onClick={(e) => handleCategoryClick(cat.id, cat.name, e)}
                      data-aoi="AOI_cel"
                    >
                      <span className="hub-tile-visual"><VisualIcon kind={getCategoryIcon(cat.id)} label={cat.name} photoKey={cat.id} /></span>
                      <strong className="hub-tile-title">{t(cat.name)}</strong>
                    </button>
                  ))}
                  {!isVersionB && <>
                  <div
                    className="hub-big-tile hub-tile-new"
                    onClick={(e) => handleCategoryClick('nowosci', 'Nowości', e)}
                    data-aoi="AOI_cel"
                  >
                    <div className="hub-tile-visual"><VisualIcon kind="burger" label="Burgery" /></div>
                    <strong className="hub-tile-title">{t('Co nowego?')}</strong>
                  </div>

                  <div
                    className="hub-big-tile hub-tile-combos"
                    onClick={(e) => handleCategoryClick('zestawy', 'Zestawy', e)}
                    data-aoi="AOI_cel"
                  >
                    <div className="hub-tile-visual"><VisualIcon kind="meal" label="Zestaw" /></div>
                    <strong className="hub-tile-title">{t('Zestawy')}</strong>
                  </div>

                  <div
                    className="hub-big-tile hub-tile-cafe"
                    onClick={(e) => handleCategoryClick('kawy', 'Kawiarnia', e)}
                    data-aoi="AOI_cel"
                  >
                    <div className="hub-tile-visual"><VisualIcon kind="drink" label="Kawiarnia" /></div>
                    <strong className="hub-tile-title">{t('Kawiarnia')}</strong>
                  </div>

                  <div
                    className="hub-big-tile hub-tile-family"
                    onClick={(e) => handleCategoryClick('super-oferta', 'Super Oferta', e)}
                    data-aoi="AOI_cel"
                  >
                    <div className="hub-tile-visual"><VisualIcon kind="fries" label="Oferta rodzinna" /></div>
                    <strong className="hub-tile-title">{t('Odkryj oferty Rodzinne')}</strong>
                  </div>
                  </>}
                </div>
                </div>
              </section>

              {!isVersionB && <section className="hub-bottom-section">
                <h2 className="hub-section-heading">{t('Spróbuj naszych nowości!')}</h2>
                <div className="hub-promo-products-row">
                  {products.filter((product) => product.isNew).slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="product-card-tile"
                      onClick={(e) => handleProductClick(product, e)}
                      data-aoi="AOI_cel"
                    >
                      {product.isNew && <span className="product-badge-new">{t('Nowość!')}</span>}
                        <div className="card-visual-wrapper"><VisualIcon label={product.name} kind={product.image} photoKey={product.id} /></div>
                      <div className="card-title-text">{t(product.name)}</div>
                      <div className="card-price-value">{formatPrice(product.price)} zł</div>
                    </div>
                  ))}
                </div>
              </section>}
            </div>
          ) : (
            /* WIDOK KATEGORII: Siatka produktów */
            <div className="category-products-view">
              {isVersionB && <button
                type="button"
                className="menu-b-categories-back"
                onClick={(e) => handleCategoryClick('menu-glowne', 'Kategorie menu', e)}
                data-aoi="AOI_wstecz"
              >← {t('Kategorie menu')}</button>}
              <div className="category-header-banner">
                <h1 className="category-current-title">
                  {t(menuCategories.find((c) => c.id === activeCategory)?.name || 'Produkty')}
                </h1>
              </div>

              <div className="products-3col-grid">
                {filteredProducts.length === 0 && (
                  <p className="empty-category-message">{t('Brak produktów w tej kategorii')}</p>
                )}
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-card-tile"
                    onClick={(e) => handleProductClick(product, e)}
                    data-aoi="AOI_cel"
                  >
                    {product.isNew && <span className="product-badge-new">{t('Nowość!')}</span>}
                    {!product.isNew && product.isDeal && <span className="product-badge-new">{t('Oferta!')}</span>}
                    <div className="card-visual-wrapper">
                      {product.category === 'frytki' && product.id.startsWith('sauce-')
                        ? <IngredientIcon id={product.id} label={product.name} />
                        : <VisualIcon label={product.name} kind={product.image} photoKey={product.id} />}
                    </div>
                    <div className="card-title-text">{t(activeCategory === 'zestawy' ? getComboProductLabel(product.name) : product.name)}</div>
                    <div className="card-price-value">{formatPrice(product.price)} zł</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </AllergensScrollbar>
        </main>
      </div>
          {isVersionB && <section className={`menu-b-search-sheet ${isKeyboardOpen ? 'expanded' : ''}`} aria-label={t('Szukaj produktu')}>
            <div className="menu-b-search-row">
              <label className="menu-b-search-label" htmlFor="menu-b-search">{t('Szukaj produktu')}</label>
              <div className="menu-b-search-input-wrap">
                <input id="menu-b-search" className="menu-b-search" type="text" value={searchQuery} readOnly
                  onFocus={() => setIsKeyboardOpen(true)} onClick={() => setIsKeyboardOpen(true)}
                  placeholder={t('Wpisz nazwę produktu')} autoComplete="off" aria-haspopup="true" aria-expanded={isKeyboardOpen} />
                {searchQuery && <button type="button" className="menu-b-search-clear" aria-label={t('Wyczyść wyszukiwanie')} onClick={() => setSearchQuery('')}>×</button>}
              </div>
              <button type="button" className="menu-b-sheet-toggle" onClick={() => setIsKeyboardOpen(false)}>
                <svg className="menu-b-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <span>{t('Szukaj')}</span>
              </button>
            </div>
            {isKeyboardOpen && <div className="menu-b-keyboard" role="group" aria-label={t('Klawiatura ekranowa')}>
              {['qwertyuiop', 'asdfghjkl'].map((row) => <div className="menu-b-keyboard-row" key={row}>
                {Array.from(row).map((letter) => <button type="button" key={letter} onClick={() => appendSearchText(letter)}>{letter}</button>)}
              </div>)}
              <div className="menu-b-keyboard-row menu-b-keyboard-letter-row">
                {Array.from('zxcvbnm').map((letter) => <button type="button" key={letter} onClick={() => appendSearchText(letter)}>{letter}</button>)}
                <button type="button" className="menu-b-backspace" aria-label={t('Usuń ostatni znak')} onClick={() => setSearchQuery((query) => query.slice(0, -1))}>⌫</button>
              </div>
              <div className="menu-b-keyboard-row menu-b-keyboard-bottom">
                <button type="button" onClick={() => appendSearchText(' ')}>{t('Spacja')}</button>
                <button type="button" onClick={() => setSearchQuery('')}>{t('Wyczyść')}</button>
                <button type="button" onClick={() => setIsKeyboardOpen(false)}>{t('Gotowe')}</button>
              </div>
            </div>}
      </section>}

      {!(isVersionB && isKeyboardOpen) && <BottomBar />}
    </div>
  );
};
