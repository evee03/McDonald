import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { products, upsellProducts } from '../../data/products';
import { VisualIcon } from '../common/VisualIcon';
import { useT } from '../../i18n';

export const UpsellModal: React.FC = () => {
  const t = useT();
  const { activeModal, closeModal, addProductToCart, navigateTo, currentScreen } = useKioskStore();

  if (activeModal !== 'upsell') return null;

  const suggestedList = products.filter((p) => upsellProducts.includes(p.id));

  const handleSelectUpsell = (product: typeof products[0], e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór upsell: ${product.name}`, e, currentScreen);
    addProductToCart(product, 1);
    closeModal('AOI_cel');
    navigateTo('menu', 'AOI_cel', 'Powrót do menu');
  };

  const handleNoThanks = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Odrzucenie upsell (Nie dziś)', e, currentScreen);
    closeModal('AOI_wstecz');
    navigateTo('menu', 'AOI_wstecz', 'Powrót do menu');
  };

  return (
    <div className="kiosk-modal-backdrop" onClick={handleNoThanks}>
      <div
        className="kiosk-upsell-dialog"
        onClick={(e) => e.stopPropagation()}
        data-aoi="AOI_cel"
      >
        <h2 className="upsell-headline">{t('A może coś jeszcze?')}</h2>

        <div className="upsell-grid">
          {suggestedList.map((item) => (
            <div
              key={item.id}
              className="upsell-item-card"
              onClick={(e) => handleSelectUpsell(item, e)}
              data-aoi="AOI_cel"
            >
              {item.isNew && <span className="upsell-new-tag">{t('Nowość!')}</span>}
              <div className="upsell-item-image"><VisualIcon kind={item.image} label={item.name} photoKey={item.id} /></div>
              <div className="upsell-item-name">{t(item.name)}</div>
              <div className="upsell-item-price">{item.price.toFixed(2)} zł</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-upsell-no"
          onClick={handleNoThanks}
          data-aoi="AOI_wstecz"
        >
          {t('Nie, dziękuję')}
        </button>
      </div>
    </div>
  );
};
