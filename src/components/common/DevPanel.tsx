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
    triggerError,
  } = useKioskStore();

  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<SessionMetrics>(eventLogger.getMetrics());
  const [interfaceCode, setInterfaceCode] = useState('6');
  const [version, setVersion] = useState<ResearchVersion>('A');
  const [order, setOrder] = useState<'AB' | 'BA'>('AB');

  const updateConfiguration = (next: { interfaceCode?: string; version?: ResearchVersion; order?: 'AB' | 'BA'; participantId?: string }) => {
    const config = {
      interfaceCode: next.interfaceCode ?? interfaceCode,
      version: next.version ?? version,
      order: next.order ?? order,
      participantId: next.participantId ?? participantId,
    };
    eventLogger.configure(config);
    setInterfaceCode(config.interfaceCode);
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

  const handleDownloadCSV = () => {
    eventLogger.downloadCSV();
  };

  const handleDownloadJSON = () => {
    eventLogger.downloadJSON(`PUN_zdarzenia_${participantId}_${activeScenario}.json`);
  };

  const handleResetSession = () => {
    eventLogger.resetSession();
    setMetrics(eventLogger.getMetrics());
  };

  const handleStartScenario = () => {
    eventLogger.setScenario(activeScenario);
    setMetrics(eventLogger.getMetrics());
  };

  const handleFinishScenario = (success: 0 | 1) => {
    eventLogger.markCompleted(success);
    setMetrics(eventLogger.getMetrics());
  };

  return (
    <aside
      className={`researcher-dev-panel ${isOpen ? 'expanded' : 'collapsed'}`}
      aria-label="Panel badacza PUN"
    >
      <button
        type="button"
        className="dev-panel-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Otwórz panel analityczny badacza PUN"
      >
        🔬 {isOpen ? 'Ukryj panel badacza' : 'Panel Badacza (PUN / Metryki)'}
      </button>

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
            <label htmlFor="dev-interface-input">Interfejs:</label>
            <input id="dev-interface-input" type="number" min="1" max="10" value={interfaceCode}
              onChange={(e) => setInterfaceCode(e.target.value)}
              onBlur={(e) => updateConfiguration({ interfaceCode: e.target.value })} className="dev-input-field" />
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
              <option value="S1">S1: Zamówienie zestawu</option>
              <option value="S2">S2: Modyfikacja zamówienia</option>
              <option value="S3">S3: Płatność i podsumowanie</option>
              <option value="FREE">Eksploracja swobodna</option>
            </select>
          </div>
          <div className="quick-nav-buttons">
            <button type="button" onClick={handleStartScenario} className="dev-btn-small">Rozpocznij scenariusz</button>
            <button type="button" onClick={() => handleFinishScenario(1)} className="dev-btn-small">Ukończ zadanie</button>
            <button type="button" onClick={() => handleFinishScenario(0)} className="dev-btn-small">Przerwij zadanie</button>
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
            <button type="button" onClick={() => triggerError('Symulowany błąd terminala (brak środków)')} className="dev-btn-small dev-btn-error">Błąd terminala</button>
            <button type="button" onClick={() => triggerError('Symulowany błąd skanera kodów')} className="dev-btn-small dev-btn-error">Błąd skanera</button>
          </div>

          <div className="panel-divider" />

          <div className="panel-section-title">EKSPORT DANYCH DO STATYSTYK</div>
          <div className="export-actions">
            <button type="button" onClick={handleDownloadCSV} className="dev-export-btn">
              📥 Pobierz CSV zdarzeń ({eventLogger.getCsvFilename()})
            </button>
            <button type="button" onClick={handleDownloadJSON} className="dev-export-btn">
              📄 Pobierz JSON ze zdarzeniami
            </button>
            <button type="button" onClick={handleResetSession} className="dev-reset-btn">
              🔄 Nowa sesja / Zeruj licznik
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
