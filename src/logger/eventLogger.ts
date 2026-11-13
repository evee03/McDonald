/**
 * Moduł rejestrowania zdarzeń (Event Logger)
 * 
 * Zgodny z wymaganiami dokumentacji badania eyetrackingowego i analizy interfejsu kiosku (PUN):
 * - Rejestruje każde dotknięcie: współrzędne (X, Y), czas, nazwę AOI, rozmiar celu
 * - Obsługuje standardowe nazwy AOI: AOI_cel, AOI_wstecz, AOI_dostepnosc, AOI_blad, AOI_tlo
 * - Zlicza metryki: czas zadania [s], liczbę dotknięć, dotknięcia obok celu (AOI_tlo), powroty (AOI_wstecz)
 * - Umożliwia pobranie danych do CSV (PUN_dane_badania.csv) oraz JSON
 */

export type StandardAOI =
  | 'AOI_cel'
  | 'AOI_wstecz'
  | 'AOI_dostepnosc'
  | 'AOI_blad'
  | 'AOI_tlo'
  | string;

export interface EventLogEntry {
  id: string;
  sessionId: string;
  scenarioId: 'S1' | 'S2' | 'S3' | 'FREE';
  participantId: string;
  timestamp: string;
  elapsedMs: number;
  type: 'click' | 'miss_click' | 'navigation' | 'error' | 'cart_action' | 'modal';
  aoi: StandardAOI;
  elementLabel: string;
  coordinates: { x: number; y: number };
  targetSize: { width: number; height: number };
  screenId: string;
  metadata?: Record<string, unknown>;
}

export interface SessionMetrics {
  sessionId: string;
  scenarioId: 'S1' | 'S2' | 'S3' | 'FREE';
  participantId: string;
  durationSeconds: number;
  totalTouches: number;
  targetTouches: number; // kliknięcia w AOI_cel
  missTouches: number; // dotknięcia obok celu (w tło)
  backReturns: number; // użycia AOI_wstecz
  errorCount: number; // liczba błędów
  accessibilityToggled: number;
  isCompleted: boolean;
}

class EventLogger {
  private logs: EventLogEntry[] = [];
  private sessionId: string;
  private scenarioId: 'S1' | 'S2' | 'S3' | 'FREE' = 'S1';
  private participantId: string = 'P01';
  private startTime: number;
  private taskCompleted: boolean = false;

  constructor() {
    this.sessionId = this.createSessionId();
    this.startTime = Date.now();
  }

  private createSessionId(): string {
    return `SES_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  public setScenario(scenario: 'S1' | 'S2' | 'S3' | 'FREE') {
    this.scenarioId = scenario;
    this.resetTimer();
  }

  public setParticipant(id: string) {
    this.participantId = id;
  }

  public resetTimer() {
    this.startTime = Date.now();
    this.taskCompleted = false;
  }

  public markCompleted() {
    this.taskCompleted = true;
  }

  /**
   * Rejestruje kliknięcie użytkownika w interfejs
   */
  public logTouch(
    aoi: StandardAOI,
    elementLabel: string,
    event: React.MouseEvent | MouseEvent | React.TouchEvent,
    screenId: string,
    metadata?: Record<string, unknown>
  ): void {
    let clientX = 0;
    let clientY = 0;

    if ('touches' in event && event.touches.length > 0) {
      clientX = Math.round(event.touches[0].clientX);
      clientY = Math.round(event.touches[0].clientY);
    } else if ('clientX' in event) {
      clientX = Math.round((event as MouseEvent).clientX);
      clientY = Math.round((event as MouseEvent).clientY);
    }

    let targetWidth = 0;
    let targetHeight = 0;
    if (event.currentTarget && 'getBoundingClientRect' in event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      targetWidth = Math.round(rect.width);
      targetHeight = Math.round(rect.height);
    }

    const entry: EventLogEntry = {
      id: `EV_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      participantId: this.participantId,
      timestamp: new Date().toISOString(),
      elapsedMs: Date.now() - this.startTime,
      type: aoi === 'AOI_tlo' ? 'miss_click' : 'click',
      aoi,
      elementLabel,
      coordinates: { x: clientX, y: clientY },
      targetSize: { width: targetWidth, height: targetHeight },
      screenId,
      metadata,
    };

    this.logs.push(entry);
    console.log(`[EventLogger] ${entry.aoi} | ${entry.elementLabel} @ (${clientX},${clientY}) screen:${screenId}`);
  }

  /**
   * Logowanie błędu aplikacji / użytkownika
   */
  public logError(errorMessage: string, screenId: string, metadata?: Record<string, unknown>) {
    const entry: EventLogEntry = {
      id: `ERR_${Date.now()}`,
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      participantId: this.participantId,
      timestamp: new Date().toISOString(),
      elapsedMs: Date.now() - this.startTime,
      type: 'error',
      aoi: 'AOI_blad',
      elementLabel: errorMessage,
      coordinates: { x: 0, y: 0 },
      targetSize: { width: 0, height: 0 },
      screenId,
      metadata,
    };
    this.logs.push(entry);
  }

  /**
   * Zwraca zagregowane metryki bieżącej sesji badawczej
   */
  public getMetrics(): SessionMetrics {
    const sessionLogs = this.logs.filter((l) => l.sessionId === this.sessionId);
    const totalTouches = sessionLogs.filter((l) => l.type === 'click' || l.type === 'miss_click').length;
    const targetTouches = sessionLogs.filter((l) => l.aoi === 'AOI_cel').length;
    const missTouches = sessionLogs.filter((l) => l.aoi === 'AOI_tlo' || l.type === 'miss_click').length;
    const backReturns = sessionLogs.filter((l) => l.aoi === 'AOI_wstecz').length;
    const errorCount = sessionLogs.filter((l) => l.aoi === 'AOI_blad' || l.type === 'error').length;
    const accessibilityToggled = sessionLogs.filter((l) => l.aoi === 'AOI_dostepnosc').length;
    const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      participantId: this.participantId,
      durationSeconds,
      totalTouches,
      targetTouches,
      missTouches,
      backReturns,
      errorCount,
      accessibilityToggled,
      isCompleted: this.taskCompleted,
    };
  }

  public getLogs(): EventLogEntry[] {
    return [...this.logs];
  }

  public exportJSON(): string {
    return JSON.stringify(
      {
        metrics: this.getMetrics(),
        events: this.logs,
      },
      null,
      2
    );
  }

  public exportCSV(): string {
    const headers = [
      'id',
      'sessionId',
      'scenarioId',
      'participantId',
      'timestamp',
      'elapsedMs',
      'type',
      'aoi',
      'elementLabel',
      'coord_x',
      'coord_y',
      'target_w',
      'target_h',
      'screenId',
    ];

    const rows = this.logs.map((e) => [
      e.id,
      e.sessionId,
      e.scenarioId,
      e.participantId,
      e.timestamp,
      e.elapsedMs,
      e.type,
      `"${e.aoi}"`,
      `"${e.elementLabel.replace(/"/g, '""')}"`,
      e.coordinates.x,
      e.coordinates.y,
      e.targetSize.width,
      e.targetSize.height,
      e.screenId,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public downloadCSV(filename = 'PUN_dane_badania.csv') {
    const csvContent = '\uFEFF' + this.exportCSV(); // UTF-8 BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public downloadJSON(filename = 'PUN_zdarzenia.json') {
    const jsonContent = this.exportJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public resetSession() {
    this.sessionId = this.createSessionId();
    this.startTime = Date.now();
    this.taskCompleted = false;
  }
}

export const eventLogger = new EventLogger();
