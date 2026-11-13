import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { products } from '../../data/products';
import { VisualIcon } from '../common/VisualIcon';
import { IngredientIcon } from '../common/IngredientIcon';
import { useT } from '../../i18n';

export const AllergensScreen: React.FC = () => {
  const t = useT();
  const { selectedProduct, goBack } = useKioskStore();

  const prod = selectedProduct || products[0];
  const isWater = prod.id === 'water-sparkling' || prod.id === 'water-still';

  const handleBack = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Powrót z ekranu alergenów (Cofnij)', e, 'allergens');
    goBack('AOI_wstecz');
  };

  return (
    <div className="kiosk-page-view allergens-page">
      <main className="allergens-scroll-body">
        <h1 className="allergens-headline">{t('Alergeny i składniki')}</h1>

        <div className="allergens-product-intro">
          <span className="allergens-prod-emoji"><VisualIcon kind={prod.image} label={prod.name} photoKey={prod.id} /></span>
          <div className="allergens-prod-meta">
            <h2 className="allergens-prod-name">{t(prod.name)}</h2>
            <p className="allergens-prod-warning">{prod.allergens || (isWater ? t('Nie zawiera alergenów.') : 'Zawiera gluten, mleko, jaja.')}</p>
          </div>
        </div>

        {/* Tabela wartości odżywczych */}
        <div className="nutrition-table-container">
          <table className="nutrition-table">
            <thead>
              <tr>
                <th>{t(isWater ? 'Porcja: 500 ml' : 'Porcja: 186g')}</th>
                <th>{t('Na 100 g')}</th>
                <th>{t('Na produkt')}</th>
                <th>% RI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{t('Wartość kaloryczna')}</strong></td>
                <td>{isWater ? '0 kJ / 0 kcal' : '965 kJ / 231 kcal'}</td>
                <td>{isWater ? '0 kJ / 0 kcal' : '2 273 kJ / 544 kcal'}</td>
                <td>{isWater ? '0%' : '27%'}</td>
              </tr>
              <tr>
                <td><strong>{t('Tłuszcze łącznie')}</strong></td>
                <td>{isWater ? '0 g' : '12 g'}</td>
                <td>{isWater ? '0 g' : '29 g'}</td>
                <td>{isWater ? '0%' : '41%'}</td>
              </tr>
              <tr className="sub-row">
                <td>{t('w tym tłuszcze nasycone')}</td>
                <td>{isWater ? '0 g' : '4,4 g'}</td>
                <td>{isWater ? '0 g' : '10 g'}</td>
                <td>{isWater ? '0%' : '51%'}</td>
              </tr>
              <tr>
                <td><strong>{t('Węglowodany')}</strong></td>
                <td>{isWater ? '0 g' : '18 g'}</td>
                <td>{isWater ? '0 g' : '42 g'}</td>
                <td>{isWater ? '0%' : '16%'}</td>
              </tr>
              <tr className="sub-row">
                <td>{t('w tym cukry')}</td>
                <td>{isWater ? '0 g' : '3,7 g'}</td>
                <td>{isWater ? '0 g' : '8,8 g'}</td>
                <td>{isWater ? '0%' : '10%'}</td>
              </tr>
              <tr>
                <td><strong>{t('Błonnik')}</strong></td>
                <td>{isWater ? '0 g' : '1,7 g'}</td>
                <td>{isWater ? '0 g' : '4,0 g'}</td>
                <td>{isWater ? '0%' : '—'}</td>
              </tr>
              <tr>
                <td><strong>{t('Białko')}</strong></td>
                <td>{isWater ? '0 g' : '12 g'}</td>
                <td>{isWater ? '0 g' : '27 g'}</td>
                <td>{isWater ? '0%' : '55%'}</td>
              </tr>
              <tr>
                <td><strong>{t('Sól')}</strong></td>
                <td>{isWater ? '0 g' : '0,98 g'}</td>
                <td>{isWater ? '0 g' : '2,3 g'}</td>
                <td>{isWater ? '0%' : '38%'}</td>
              </tr>
            </tbody>
          </table>
          <p className="nutrition-footnote">
            RI – Referencyjna wartość spożycia dla przeciętnej osoby dorosłej (8400 kJ / 2000 kcal).
          </p>
        </div>

        {/* Informacje o alergenach */}
        <div className="allergens-legal-disclaimer">
          <p>
            Przedstawione informacje o substancjach alergennych w naszych produktach zostały przygotowane na podstawie deklaracji naszych dostawców. W trakcie przygotowywania i wydawania produktów może dojść do niezamierzonego przeniesienia składników alergennych.
          </p>
          <p>
            Wartości odżywcze nie uwzględniają ewentualnej zmiany składników dokonywanej na życzenie gościa w ramach personalizacji produktu.
          </p>
        </div>

        {/* Lista składników */}
        <div className="allergens-ingredients-list-section">
          <h3 className="section-title">{t('Składniki')}</h3>
          <div className="ingredients-display-list">
            {(prod.ingredients || []).map((ing) => (
              <div key={ing.id} className="ing-display-row">
                <span className="ingredient-icon-wrap"><IngredientIcon id={ing.id} label={t(ing.name)} /></span>
                <span className="ing-title">{t(ing.name)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="allergens-footer-bar">
        <button
          type="button"
          className="btn-allergens-back"
          onClick={handleBack}
          data-aoi="AOI_wstecz"
        >
          {t('Cofnij')}
        </button>
      </footer>
    </div>
  );
};
