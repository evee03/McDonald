import React from 'react';
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
  const t = useT();
  const {
    activeCategory,
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
    <div className="kiosk-page-view menu-page">
      <div className="menu-layout-container">
        {/* Lewy panel nawigacji po kategoriach */}
        <aside className="menu-sidebar" aria-label="Kategorie menu">
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
        </aside>

        {/* Prawy obszar z kafelkami produktów */}
        <main className="menu-main-content">
          <AllergensScrollbar className="menu-scroll-shell" contentClassName="menu-scroll-body" contentElement="div">
          {activeCategory === 'menu-glowne' ? (
            /* WIDOK GŁÓWNY: Kafelki sekcji + Nowości */
            <div className="menu-hub-view">
              <section className="hub-top-section">
                <h2 className="hub-section-heading">{t('Sprawdź nasze menu')}</h2>
                <div className="hub-featured-grid">
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
                </div>
              </section>

              <section className="hub-bottom-section">
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
              </section>
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

      <BottomBar />
    </div>
  );
};
