import React, { useEffect } from 'react';
import { eventLogger } from './logger/eventLogger';
import { useKioskStore } from './store/kioskStore';

// Ekrany
import { AllergensScreen } from './components/screens/AllergensScreen';
import { CartScreen } from './components/screens/CartScreen';
import { ComboBuilderScreen } from './components/screens/ComboBuilderScreen';
import { ComboPromptScreen } from './components/screens/ComboPromptScreen';
import { DineChoiceScreen } from './components/screens/DineChoiceScreen';
import { LanguageScreen } from './components/screens/LanguageScreen';
import { MenuScreen } from './components/screens/MenuScreen';
import { PaymentMethodScreen } from './components/screens/PaymentMethodScreen';
import { PaymentProcessingScreen } from './components/screens/PaymentProcessingScreen';
import { PaymentSuccessScreen } from './components/screens/PaymentSuccessScreen';
import { PersonalizeScreen } from './components/screens/PersonalizeScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';

// Modale
import { DevPanel } from './components/common/DevPanel';
import { ErrorModal } from './components/modals/ErrorModal';
import { ProductAddedModal } from './components/modals/ProductAddedModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { RestartModal } from './components/modals/RestartModal';
import { UpsellModal } from './components/modals/UpsellModal';

import './styles/kiosk.css';
import './styles/kioskB.css';

export const App: React.FC = () => {
  const { currentScreen, isAccessibilityMode, interfaceVersion } = useKioskStore();

  useEffect(() => {
    const viewport = document.querySelector<HTMLElement>('.kiosk-screen-viewport');
    if (!viewport) return;
    const getInteractiveElements = () => Array.from(viewport.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), [role="button"], [role="alert"], [data-aoi]'
    ));
    eventLogger.logScreen(currentScreen, viewport.getBoundingClientRect(), getInteractiveElements());

    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => eventLogger.syncAois(currentScreen, getInteractiveElements()));
    });
    observer.observe(viewport, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'aria-hidden', 'disabled'] });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [currentScreen]);

  // Przechwytywanie kliknięć w nieaktywne tło ekranu (AOI_tlo - dotknięcia obok celu wg Tabeli 8)
  const handleViewportBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.kiosk-screen-viewport') || target.closest('.researcher-dev-panel')) return;
    if (target.closest('button, a, input, [role="button"], [data-aoi]')) return;

    eventLogger.logTouch('AOI_tlo', 'Dotknięcie obok celu (w tło interfejsu)', e, currentScreen);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'language-select':
        return <LanguageScreen />;
      case 'dine-choice':
        return <DineChoiceScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'combo-prompt':
        return <ComboPromptScreen />;
      case 'combo-builder':
        return <ComboBuilderScreen />;
      case 'personalize':
        return <PersonalizeScreen />;
      case 'cart':
        return <CartScreen />;
      case 'payment-method':
        return <PaymentMethodScreen />;
      case 'payment-processing':
        return <PaymentProcessingScreen />;
      case 'payment-success':
        return <PaymentSuccessScreen />;
      case 'allergens':
        return <AllergensScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className={`kiosk-app-environment kiosk-version-${interfaceVersion.toLowerCase()}`} onClick={handleViewportBackgroundClick}>
      {/* Widok obejmuje wyłącznie pionowy ekran kiosku. */}
      <div className="kiosk-screen-shell">
        <div className={`kiosk-screen-viewport ${isAccessibilityMode ? 'a11y-mode' : ''}`} data-screen={currentScreen}>
          <div className="kiosk-screen-content">
            {renderActiveScreen()}

        {/* Globalne modale i okna dialogowe */}
        <ProductDetailModal />
        <RestartModal />
        <ErrorModal />
        <ProductAddedModal />
        <UpsellModal />
          </div>
        </div>
      </div>
      <DevPanel />
    </div>
  );
};

export default App;
