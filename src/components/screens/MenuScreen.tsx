import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { getComboProductLabel, menuCategories, products, type Product } from '../../data/products';
import { useT } from '../../i18n';
import { eventLogger } from '../../logger/eventLogger';
import { useKioskStore } from '../../store/kioskStore';
import { formatPrice } from '../../utils/formatPrice';
import { AllergensScrollbar } from '../common/AllergensScrollbar';
import { BottomBar } from '../common/BottomBar';
import { IngredientIcon } from '../common/IngredientIcon';
import { VisualIcon } from '../common/VisualIcon';

export const MenuScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const menuHubScrollTopRef = useRef<number>(0);
  const t = useT();
  const {
    activeCategory,
    interfaceVersion,
    dineOption,
    openModal,
    setActiveCategory,
    openProductDetail,
    startComboBuilder,
  } = useKioskStore();

  const handleCategoryClick = (catId: string, catName: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór kategorii menu: ${catName}`, e, 'menu');

    if (isVersionB && typeof document !== 'undefined' && 'startViewTransition' in document) {
      const doc = document as unknown as {
        startViewTransition: (cb: () => void) => { finished?: Promise<void> };
      };

      // 1. Z menu głównego do wybranej kategorii — kafelek rozwija się w całą stronę
      if (activeCategory === 'menu-glowne' && catId !== 'menu-glowne') {
        // Zapamiętujemy dokładną pozycję przewinięcia huba, aby móc do niej bezbłędnie wrócić
        const currentScrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
        if (currentScrollBody) {
          menuHubScrollTopRef.current = currentScrollBody.scrollTop;
        }

        const clickedTile = ((e.currentTarget as HTMLElement).closest('.menu-b-category-tile') as HTMLElement) || (e.currentTarget as HTMLElement);
        if (clickedTile) {
          clickedTile.style.viewTransitionName = 'category-view-morph';
        }

        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            setActiveCategory(catId);
            if (searchQuery) setSearchQuery('');
          });
          const scrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
          if (scrollBody) scrollBody.scrollTop = 0;
        });

        const cleanup = () => {
          if (clickedTile) clickedTile.style.viewTransitionName = '';
        };

        if (transition && transition.finished && typeof transition.finished.finally === 'function') {
          transition.finished.finally(cleanup);
        } else {
          setTimeout(cleanup, 260);
        }
        return;
      }

      // 2. Powrót z kategorii do menu głównego — strona zwija się z powrotem do kafelka
      if (activeCategory !== 'menu-glowne' && catId === 'menu-glowne') {
        const prevCatId = activeCategory;
        let targetTile: HTMLElement | null = null;

        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            setActiveCategory('menu-glowne');
            if (searchQuery) setSearchQuery('');
          });

          // Przywracamy pozycję scrolla huba, ZANIM silnik View Transitions przechwyci położenie kafelka
          const scrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
          if (scrollBody) {
            scrollBody.scrollTop = menuHubScrollTopRef.current;
          }

          targetTile = document.querySelector(`.kiosk-version-b .menu-b-category-tile[data-category-id="${prevCatId}"]`) as HTMLElement;
          if (targetTile) {
            targetTile.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            targetTile.style.viewTransitionName = 'category-view-morph';
          }
        });

        const cleanup = () => {
          if (targetTile) targetTile.style.viewTransitionName = '';
          const tile = document.querySelector(`.kiosk-version-b .menu-b-category-tile[data-category-id="${prevCatId}"]`) as HTMLElement;
          if (tile) tile.style.viewTransitionName = '';
        };

        if (transition && transition.finished && typeof transition.finished.finally === 'function') {
          transition.finished.finally(cleanup);
        } else {
          setTimeout(cleanup, 260);
        }
        return;
      }

      // Fallback dla pozostałych przejść
      doc.startViewTransition(() => {
        flushSync(() => {
          setActiveCategory(catId);
          if (searchQuery) setSearchQuery('');
        });
        const scrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
        if (scrollBody) scrollBody.scrollTop = 0;
      });
      return;
    }

    if (isVersionB && activeCategory === 'menu-glowne' && catId !== 'menu-glowne') {
      const currentScrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
      if (currentScrollBody) {
        menuHubScrollTopRef.current = currentScrollBody.scrollTop;
      }
    }

    setActiveCategory(catId);
    if (isVersionB) {
      if (searchQuery) setSearchQuery('');
      const scrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
      if (scrollBody) {
        if (catId === 'menu-glowne') {
          scrollBody.scrollTop = menuHubScrollTopRef.current;
          const target = document.querySelector(`.kiosk-version-b .menu-b-category-tile[data-category-id="${catId}"]`) as HTMLElement;
          if (target) target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          scrollBody.scrollTop = 0;
        }
      }
    }
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

  // Utrzymanie stabilnego przewijania na górze przy wpisywaniu wyszukiwania (zapobiega przeskakiwaniu)
  useEffect(() => {
    if (isVersionB && searchQuery.trim().length > 0) {
      const scrollBody = document.querySelector('.kiosk-version-b .menu-scroll-body');
      if (scrollBody && scrollBody.scrollTop > 0) {
        scrollBody.scrollTop = 0;
      }
    }
  }, [searchQuery, isVersionB]);

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
              <button
                type="button"
                className={`dine-option-indicator ${(dineOption || 'na-miejscu') === 'na-miejscu' ? 'dine-in' : 'takeaway'}`}
                onClick={(e) => {
                  eventLogger.logTouch('AOI_cel', `Kliknięcie wskaźnika formy zamówienia: ${dineOption || 'na-miejscu'}`, e, 'menu');
                  openModal('dine-option-change');
                }}
                data-aoi="AOI_cel"
                title={t('Zmień formę zamówienia')}
                aria-label={`Forma zamówienia: ${(dineOption || 'na-miejscu') === 'na-miejscu' ? t('Na Miejscu') : t('Na Wynos')}. ${t('Kliknij, aby zmienić.')}`}
              >
                <span className="dine-indicator-icon" aria-hidden="true">
                  {(dineOption || 'na-miejscu') === 'na-miejscu' ? '🍽️' : '🛍️'}
                </span>
                <span className="dine-indicator-label">
                  {(dineOption || 'na-miejscu') === 'na-miejscu' ? t('Na Miejscu') : t('Na Wynos')}
                </span>
                <span className="dine-indicator-change" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </button>
            </div>
          </header>}
          <AllergensScrollbar
            className={`menu-scroll-shell ${isVersionB && activeCategory !== 'menu-glowne' ? 'category-view-active' : ''}`}
            contentClassName="menu-scroll-body"
            contentElement="div"
          >
            {isVersionB && searchQuery.trim() ? (
              <section className="menu-b-search-results">
                <h2 className="hub-section-heading">
                  {t('Wyniki wyszukiwania')} {searchResults.length > 0 && `(${searchResults.length})`}
                </h2>
                {searchResults.length === 0 ? (
                  <div className="menu-b-no-results">
                    <div className="menu-b-no-results-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.5" y1="16.5" x2="21" y2="21" />
                        <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="menu-b-no-results-title">
                      {t('Brak wyników dla')} <span className="menu-b-no-results-query">„{searchQuery}”</span>
                    </h3>
                    <p className="menu-b-no-results-desc">
                      {t('Spróbuj wpisać inną nazwę lub wybierz coś z menu.')}
                    </p>
                    <button
                      type="button"
                      className="menu-b-no-results-clear-btn"
                      onClick={() => setSearchQuery('')}
                      data-aoi="AOI_cel"
                    >
                      {t('Pokaż całe menu')}
                    </button>
                  </div>
                ) : (
                  <div className="products-3col-grid">
                    {searchResults.map((product) => (
                      <div key={product.id} className="product-card-tile" onClick={(e) => handleProductClick(product, e)} data-aoi="AOI_cel">
                        <div className="card-visual-wrapper"><VisualIcon label={product.name} kind={product.image} photoKey={product.id} /></div>
                        <div className="card-title-text">{t(product.name)}</div>
                        <div className="card-price-value">{formatPrice(product.price)} zł</div>
                      </div>
                    ))}
                  </div>
                )}
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
                        return (
                          <button
                            type="button"
                            key={categoryId}
                            data-category-id={categoryId}
                            className="hub-big-tile menu-b-category-tile"
                            onClick={(e) => handleCategoryClick(categoryId, category.name, e)}
                            data-aoi="AOI_cel"
                          >
                            <span className="hub-tile-visual"><VisualIcon kind={categoryId === 'nowosci' ? 'burger' : 'fries'} label={category.name} photoKey={categoryId} /></span>
                            <strong className="hub-tile-title">{t(category.name)}</strong>
                          </button>
                        );
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
                          data-category-id={cat.id}
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
      {isVersionB && (
        <section className={`menu-b-search-sheet ${isKeyboardOpen ? 'expanded' : ''}`} aria-label={t('Szukaj produktu')}>
          {activeCategory !== 'menu-glowne' && (
            <button
              type="button"
              className="menu-b-floating-back-btn"
              onClick={(e) => handleCategoryClick('menu-glowne', 'Kategorie menu', e)}
              data-aoi="AOI_wstecz"
              title={t('Wróć do menu')}
            >
              <svg className="menu-b-back-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span>{t('Wróć do menu')}</span>
            </button>
          )}
          <div className="menu-b-search-row">
            <label className="menu-b-search-label" htmlFor="menu-b-search">{t('Znajdź produkt')}</label>
            <div className="menu-b-search-input-group">
              <div className="menu-b-search-input-wrap">
                <input
                  id="menu-b-search"
                  className="menu-b-search"
                  type="text"
                  value={searchQuery}
                  readOnly
                  onFocus={() => setIsKeyboardOpen(true)}
                  onClick={() => setIsKeyboardOpen(true)}
                  placeholder={t('Wpisz nazwę produktu')}
                  autoComplete="off"
                  aria-haspopup="true"
                  aria-expanded={isKeyboardOpen}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="menu-b-search-clear"
                    aria-label={t('Wyczyść wyszukiwanie')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="button"
                className={`menu-b-sheet-toggle ${isKeyboardOpen ? 'open' : ''}`}
                onClick={() => setIsKeyboardOpen((prev) => !prev)}
                aria-expanded={isKeyboardOpen}
                title={isKeyboardOpen ? t('Schowaj klawiaturę') : t('Otwórz klawiaturę')}
                data-aoi="AOI_cel"
              >
                <svg className="menu-b-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.6" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <span>{t('Szukaj')}</span>
              </button>
            </div>
          </div>

          <div className={`menu-b-keyboard-anim-wrap ${isKeyboardOpen ? 'open' : ''}`} aria-hidden={!isKeyboardOpen}>
            <div className="menu-b-keyboard" role="group" aria-label={t('Klawiatura ekranowa')}>
              <div className="menu-b-keyboard-row menu-b-keyboard-row-1">
                {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((letter) => (
                  <button
                    type="button"
                    key={letter}
                    className="menu-b-key"
                    onClick={() => appendSearchText(letter)}
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="menu-b-keyboard-row menu-b-keyboard-row-2">
                <div className="menu-b-key-spacer half" aria-hidden="true" />
                {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((letter) => (
                  <button
                    type="button"
                    key={letter}
                    className="menu-b-key"
                    onClick={() => appendSearchText(letter)}
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
                <div className="menu-b-key-spacer half" aria-hidden="true" />
              </div>
              <div className="menu-b-keyboard-row menu-b-keyboard-row-3">
                <div className="menu-b-key-spacer" aria-hidden="true" />
                {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((letter) => (
                  <button
                    type="button"
                    key={letter}
                    className="menu-b-key"
                    onClick={() => appendSearchText(letter)}
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  className="menu-b-key menu-b-key-backspace"
                  aria-label={t('Usuń ostatni znak')}
                  title={t('Usuń')}
                  onClick={() => setSearchQuery((query) => query.slice(0, -1))}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              </div>
              <div className="menu-b-keyboard-row menu-b-keyboard-row-bottom">
                <button
                  type="button"
                  className="menu-b-key menu-b-key-clear"
                  onClick={() => setSearchQuery('')}
                  title={t('Wyczyść')}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>{t('Wyczyść')}</span>
                </button>
                <button
                  type="button"
                  className="menu-b-key menu-b-key-space"
                  onClick={() => appendSearchText(' ')}
                  aria-label={t('Spacja')}
                >
                  {t('Spacja')}
                </button>
                <button
                  type="button"
                  className="menu-b-key menu-b-key-done"
                  onClick={() => setIsKeyboardOpen(false)}
                  title={t('Gotowe')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('Gotowe')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {isVersionB ? (
        <div className={`menu-b-bottom-bar-anim-wrap ${isKeyboardOpen ? 'hidden' : ''}`}>
          <BottomBar />
        </div>
      ) : (
        <BottomBar />
      )}
    </div>
  );
};
