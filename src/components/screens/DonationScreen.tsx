import React from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger } from '../../logger/eventLogger';
import { BottomBar } from '../common/BottomBar';

export const DonationScreen: React.FC = () => {
  const { getCartTotal, setDonation } = useKioskStore();

  const currentTotal = getCartTotal();
  // Zaokrąglenie do pełnego złotego w górę
  const roundedTarget = Math.ceil(currentTotal);
  const roundDiff = Math.round((roundedTarget - currentTotal) * 100) / 100;
  const roundAmount = roundDiff > 0 ? roundDiff : 1.00;

  const handleRoundDonation = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', `Wybór darowizny (zaokrąglenie): ${roundAmount.toFixed(2)} zł`, e, 'donation');
    setDonation(roundAmount);
  };

  const handleFixedDonation = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_cel', 'Wybór stałej darowizny: 0.10 zł', e, 'donation');
    setDonation(0.10);
  };

  const handleSkipDonation = (e: React.MouseEvent) => {
    eventLogger.logTouch('AOI_wstecz', 'Pominięcie darowizny (Nie dziś)', e, 'donation');
    setDonation(0);
  };

  return (
    <div className="kiosk-page-view donation-page">
      <main className="donation-dialog-content">
        <div className="charity-foundation-logo">
          <div className="foundation-roof-shape">▲</div>
          <div className="foundation-house-box">
            <span className="heart-icon-center">❤️</span>
          </div>
          <div className="foundation-brand-title">Dom Fundacji Dzieciom</div>
        </div>

        <h1 className="donation-headline">
          Czy chcesz przekazać darowiznę na rzecz Domu Fundacji?
        </h1>
        <p className="donation-subtext">
          Fundacja pomaga, aby cała rodzina mogła być razem w czasie leczenia szpitalnego dziecka.
        </p>

        <div className="donation-options-stack">
          <button
            type="button"
            className="btn-donation-round"
            onClick={handleRoundDonation}
            data-aoi="AOI_cel"
          >
            Zaokrąglij {roundAmount.toFixed(2)} zł
          </button>

          <span className="donation-or-separator">lub</span>

          <button
            type="button"
            className="btn-donation-fixed"
            onClick={handleFixedDonation}
            data-aoi="AOI_cel"
          >
            Przekaż darowiznę 0,10 zł
          </button>

          <button
            type="button"
            className="btn-donation-skip"
            onClick={handleSkipDonation}
            data-aoi="AOI_wstecz"
          >
            Nie dziś
          </button>
        </div>
      </main>

      <BottomBar />
    </div>
  );
};
