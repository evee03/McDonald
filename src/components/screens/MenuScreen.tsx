import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { menuCategories, products, type Product } from '../../data/products';
import { BottomBar } from '../common/BottomBar';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const MenuScreen: React.FC = () => {
  const t = useT();
  const {
    activeCategory,
    setActiveCategory,
    openProductDetail,
  } = useKioskStore();

  const handleCategoryClick = (catId: string, catName: string, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór kategorii menu: ${catName}`, e, 'menu');
    setActiveCategory(catId);
  };

  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór produktu: ${product.name} (${product.price.toFixed(2)} zł)`, e, 'menu');
    openProductDetail(product);
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
                  <span className="nav-item-icon"><VisualIcon kind={cat.id === 'menu-glowne' ? 'home' : cat.id === 'zestawy' ? 'meal' : 'category'} label={cat.name} /></span>
                  <span className="nav-item-text">{t(cat.name)}</span>
                </button>
              ))}
          </div>
        </aside>

        {/* Prawy obszar z kafelkami produktów */}
        <main className="menu-main-content">
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
                      <div className="card-price-value">{product.price.toFixed(2)} zł</div>
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
                    <div className="card-visual-wrapper"><VisualIcon label={product.name} kind={product.image} photoKey={product.id} /></div>
                    <div className="card-title-text">{t(product.name)}</div>
                    <div className="card-price-value">{product.price.toFixed(2)} zł</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomBar />
    </div>
  );
};
