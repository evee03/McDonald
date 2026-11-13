import React from 'react';
import { useKioskStore } from './store/kioskStore';
import { eventLogger } from './logger/eventLogger';

// Ekrany
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LanguageScreen } from './components/screens/LanguageScreen';
import { DineChoiceScreen } from './components/screens/DineChoiceScreen';
import { MenuScreen } from './components/screens/MenuScreen';
import { ComboPromptScreen } from './components/screens/ComboPromptScreen';
import { ComboBuilderScreen } from './components/screens/ComboBuilderScreen';
import { PersonalizeScreen } from './components/screens/PersonalizeScreen';
import { CartScreen } from './components/screens/CartScreen';
import { PaymentMethodScreen } from './components/screens/PaymentMethodScreen';
import { PaymentProcessingScreen } from './components/screens/PaymentProcessingScreen';
import { PaymentSuccessScreen } from './components/screens/PaymentSuccessScreen';
import { AllergensScreen } from './components/screens/AllergensScreen';

// Modale
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { RestartModal } from './components/modals/RestartModal';
import { ErrorModal } from './components/modals/ErrorModal';
import { ProductAddedModal } from './components/modals/ProductAddedModal';
import { UpsellModal } from './components/modals/UpsellModal';

import './styles/kiosk.css';

export const App: React.FC = () => {
  const { currentScreen, isAccessibilityMode } = useKioskStore();

  // Przechwytywanie kliknięć w nieaktywne tło ekranu (AOI_tlo - dotknięcia obok celu wg Tabeli 8)
  const handleViewportBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Sprawdzamy czy kliknięto bezpośrednio w kontener lub tło, a nie w przycisk lub kafelek
    if (
      target.classList.contains('kiosk-screen-content') ||
      target.classList.contains('menu-main-content') ||
      target.classList.contains('kiosk-page-view') ||
      target.classList.contains('kiosk-screen-viewport')
    ) {
      eventLogger.logTouch('AOI_tlo', 'Dotknięcie obok celu (w tło interfejsu)', e, currentScreen);
    }
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
    <div className="kiosk-app-environment" onClick={handleViewportBackgroundClick}>
      {/* Widok obejmuje wyłącznie pionowy ekran kiosku. */}
      <div className="kiosk-screen-shell">
        <div className={`kiosk-screen-viewport ${isAccessibilityMode ? 'a11y-mode' : ''}`}>
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
    </div>
  );
};

export default App;
