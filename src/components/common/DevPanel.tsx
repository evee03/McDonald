import React, { useState, useEffect } from 'react';
import { useKioskStore } from '../../store/kioskStore';
import { eventLogger, type ResearchVersion, type SessionMetrics } from '../../logger/eventLogger';

export const DevPanel: React.FC = () => {
  const {
    activeScenario,
    setScenario,
    participantId,
    setParticipant,
    currentScreen,
    navigateTo,
    resetAll,
    setInterfaceVersion,
  } = useKioskStore();

  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<SessionMetrics>(eventLogger.getMetrics());
  const [version, setVersion] = useState<ResearchVersion>('A');
  const [order, setOrder] = useState<'AB' | 'BA'>('AB');

  const updateConfiguration = (next: { version?: ResearchVersion; order?: 'AB' | 'BA'; participantId?: string }) => {
    const config = {
      version: next.version ?? version,
      order: next.order ?? order,
      participantId: next.participantId ?? participantId,
    };
    eventLogger.configure(config);
    if (next.version) setInterfaceVersion(next.version);
    setVersion(config.version);
    setOrder(config.order);
    setMetrics(eventLogger.getMetrics());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(eventLogger.getMetrics());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleDownloadCSV = () => {
    eventLogger.downloadCSV();
  };

  const handlePrepareNextStudy = () => {
    const match = participantId.trim().match(/^(.*?)(\d+)$/);
    const nextParticipantId = match
      ? `${match[1]}${String(Number(match[2]) + 1).padStart(match[2].length, '0')}`
      : `${participantId.trim() || 'P'}01`;

    setScenario('S1');
    resetAll();
    setParticipant(nextParticipantId);
    setMetrics(eventLogger.getMetrics());
  };

  return (
    <aside
      className={`researcher-dev-panel ${isOpen ? 'expanded' : 'collapsed'}`}
      aria-label="Panel badacza PUN"
    >
      {isOpen && (
        <div className="dev-panel-body">
          <div className="panel-section-title">KONFIGURACJA BADANIA (PUN 2026)</div>

          <div className="dev-row">
            <label htmlFor="dev-participant-input">Kod uczestnika:</label>
            <input
              id="dev-participant-input"
              type="text"
              value={participantId}
              onChange={(e) => setParticipant(e.target.value)}
              onBlur={(e) => updateConfiguration({ participantId: e.target.value })}
              className="dev-input-field"
            />
          </div>

          <div className="dev-row">
            <label htmlFor="dev-version-select">Wersja:</label>
            <select id="dev-version-select" value={version}
              onChange={(e) => updateConfiguration({ version: e.target.value as ResearchVersion })} className="dev-select-field">
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>

          <div className="dev-row">
            <label htmlFor="dev-order-select">Kolejność:</label>
            <select id="dev-order-select" value={order}
              onChange={(e) => updateConfiguration({ order: e.target.value as 'AB' | 'BA' })} className="dev-select-field">
              <option value="AB">AB</option>
              <option value="BA">BA</option>
            </select>
          </div>

          <div className="dev-row">
            <label htmlFor="dev-scenario-select">Scenariusz:</label>
            <select
              id="dev-scenario-select"
              value={activeScenario}
              onChange={(e) => setScenario(e.target.value as 'S1' | 'S2' | 'S3' | 'FREE')}
              className="dev-select-field"
            >
              <option value="S1">S1 — Dwa burgery z bekonem</option>
              <option value="S2">S2 — Burger z modyfikacją</option>
              <option value="S3">S3 — Zestaw z sokiem</option>
            </select>
          </div>
          <div className="dev-scenario-instruction">
            {activeScenario === 'S1' && 'Zamów dwa burgery z bekonem na wynos i zapłać kartą.'}
            {activeScenario === 'S2' && 'Zamów zwykłego burgera na miejscu, zmodyfikuj go, aby zawierał 3 plastry sera i zapłać kartą.'}
            {activeScenario === 'S3' && 'Zamów standardowy zestaw na wynos składający się ze zwykłego burgera, frytek oraz soku pomarańczowego i zapłać gotówką.'}
          </div>
          <div className="quick-nav-buttons">
            <button type="button" onClick={handlePrepareNextStudy} className="dev-btn-small">Przygotuj do kolejnego badania</button>
          </div>

          <div className="panel-divider" />

          <div className="panel-section-title">METRYKI ZADANIA (TABELA 8)</div>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-num">{metrics.durationSeconds} s</span>
              <span className="metric-desc">Czas zadania</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{metrics.totalTouches}</span>
              <span className="metric-desc">Liczba dotknięć</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{metrics.targetTouches}</span>
              <span className="metric-desc">W AOI_cel</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{metrics.missTouches}</span>
              <span className="metric-desc">Obok celu</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{metrics.backReturns}</span>
              <span className="metric-desc">Powroty (Wstecz)</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{metrics.errorCount}</span>
              <span className="metric-desc">Błędy (AOI_blad)</span>
            </div>
          </div>

          <div className="panel-divider" />

          <div className="panel-section-title">SZYBKIE PRZEJŚCIE DO EKRANÓW SCENARIUSZY</div>
          <div className="quick-nav-buttons">
            <button type="button" onClick={() => navigateTo('welcome')} className="dev-btn-small">Start (Welcome)</button>
            <button type="button" onClick={() => navigateTo('menu')} className="dev-btn-small">Menu (S1)</button>
            <button type="button" onClick={() => navigateTo('cart')} className="dev-btn-small">Koszyk (S2)</button>
            <button type="button" onClick={() => navigateTo('payment-method')} className="dev-btn-small">Płatność (S3)</button>
          </div>

          <div className="panel-divider" />

          <div className="panel-section-title">EKSPORT DANYCH DO STATYSTYK</div>
          <div className="export-actions">
            <button type="button" onClick={handleDownloadCSV} className="dev-export-btn">
              📥 Eksportuj CSV
            </button>
          </div>
          <div className="dev-screen-info">
            Aktywny ekran: <strong>{currentScreen}</strong>
          </div>
        </div>
      )}
    </aside>
  );
};
