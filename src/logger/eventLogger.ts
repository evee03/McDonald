import type React from 'react';

export type StandardAOI = 'AOI_cel' | 'AOI_wstecz' | 'AOI_dostepnosc' | 'AOI_blad' | 'AOI_tlo' | string;
export type ResearchScenario = 'S1' | 'S2' | 'S3' | 'FREE';
export type ResearchVersion = 'A' | 'B';

export interface PUNEvent {
  interfejs: string;
  uczestnik: string;
  wersja: ResearchVersion;
  kolejnosc: 'AB' | 'BA';
  scenariusz: string;
  czas_lokalny: string;
  czas_epoch_ms: number;
  czas_ms: number | '';
  zdarzenie: string;
  ekran: string;
  element: string;
  etykieta: string;
  x: number | '';
  y: number | '';
  szer: number | '';
  wys: number | '';
  trafienie: number | '';
  aoi: string;
  sukces: number | '';
  opis: string;
}

export interface SessionMetrics {
  sessionId: string;
  scenarioId: ResearchScenario;
  participantId: string;
  durationSeconds: number;
  totalTouches: number;
  targetTouches: number;
  missTouches: number;
  backReturns: number;
  errorCount: number;
  accessibilityToggled: number;
  isCompleted: boolean;
}

const CSV_HEADERS = [
  'interfejs', 'uczestnik', 'wersja', 'kolejnosc', 'scenariusz', 'czas_lokalny', 'czas_epoch_ms', 'czas_ms',
  'zdarzenie', 'ekran', 'element', 'etykieta', 'x', 'y', 'szer', 'wys', 'trafienie', 'aoi', 'sukces', 'opis',
] as const;

const localTimestamp = (date: Date) => {
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
};

const identifier = (value: string) => value
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 64) || 'element';

const safeLabel = (label: string) => label
  .replace(/((?:nip|blik|kod(?: kuponu)?|numer)\s*[:#]?\s*)(?:\d[\d\s-]{2,}|[A-Z0-9]{6,})/gi, '$1[ukryto]')
  .slice(0, 240);

class EventLogger {
  private logs: PUNEvent[] = [];
  private activeAois = new Map<string, Pick<PUNEvent, 'ekran' | 'element' | 'etykieta' | 'x' | 'y' | 'szer' | 'wys' | 'aoi'>>();
  private sessionId = this.createSessionId();
  private scenarioId: ResearchScenario = 'S1';
  private participantId = 'P01';
  private interfaceCode = '6';
  private version: ResearchVersion = 'A';
  private order: 'AB' | 'BA' = 'AB';
  private sessionStart = Date.now();
  private taskStart: number | null = null;
  private taskCompleted = false;

  constructor() {
    this.logSession();
  }

  private createSessionId() { return `SES_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

  private append(data: Partial<PUNEvent>) {
    const now = Date.now();
    this.logs.push({
      interfejs: this.interfaceCode,
      uczestnik: this.participantId,
      wersja: this.version,
      kolejnosc: this.order,
      scenariusz: this.scenarioId === 'FREE' ? '' : this.scenarioId,
      czas_lokalny: localTimestamp(new Date(now)),
      czas_epoch_ms: now,
      czas_ms: this.taskStart === null ? '' : now - this.taskStart,
      zdarzenie: '', ekran: '', element: '', etykieta: '', x: '', y: '', szer: '', wys: '', trafienie: '', aoi: '', sukces: '', opis: '',
      ...data,
    });
  }

  private logSession() {
    const screen = `${window.screen.width}x${window.screen.height}`;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    this.append({
      zdarzenie: 'sesja',
      opis: `skalowanie=${window.devicePixelRatio === 1 ? '100% (DPR=1)' : `DPR=${window.devicePixelRatio}`} okno=${viewport} ekran=${screen}; zalecany tryb pełnoekranowy i skalowanie systemu 100%`,
    });
  }

  private recordCurrentScreen() {
    const viewport = document.querySelector<HTMLElement>('.kiosk-screen-viewport');
    if (!viewport) return;
    const screenId = viewport.dataset.screen || 'start';
    const elements = Array.from(viewport.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), [role="button"], [role="alert"], [data-aoi]'
    ));
    this.logScreen(screenId, viewport.getBoundingClientRect(), elements);
  }

  configure(config: { interfaceCode?: string; version?: ResearchVersion; order?: 'AB' | 'BA'; participantId?: string }) {
    if (config.interfaceCode !== undefined) this.interfaceCode = config.interfaceCode.trim() || '6';
    if (config.version) this.version = config.version;
    if (config.order) this.order = config.order;
    if (config.participantId !== undefined) this.participantId = config.participantId.trim() || 'P01';
    this.logs = [];
    this.activeAois.clear();
    this.sessionId = this.createSessionId();
    this.sessionStart = Date.now();
    this.taskStart = null;
    this.taskCompleted = false;
    this.logSession();
    this.recordCurrentScreen();
  }

  setScenario(scenario: ResearchScenario) {
    if (this.taskStart !== null && !this.taskCompleted) this.markCompleted(0);
    this.scenarioId = scenario;
    this.taskCompleted = false;
    this.taskStart = scenario === 'FREE' ? null : Date.now();
    if (scenario !== 'FREE') this.append({ zdarzenie: 'scenariusz_start', czas_ms: 0 });
  }

  setParticipant(id: string) { this.participantId = id.trim() || 'P01'; }

  logScreen(screenId: string, rect: DOMRect, interactiveElements: HTMLElement[]) {
    this.activeAois.clear();
    const x = Math.round(window.screenX + rect.left);
    const y = Math.round(window.screenY + rect.top);
    this.append({ zdarzenie: 'ekran', ekran: screenId, x, y, szer: Math.round(rect.width), wys: Math.round(rect.height) });
    this.syncAois(screenId, interactiveElements);
  }

  syncAois(screenId: string, interactiveElements: HTMLElement[]) {
    const nextAois = new Map<string, Pick<PUNEvent, 'ekran' | 'element' | 'etykieta' | 'x' | 'y' | 'szer' | 'wys' | 'aoi'>>();
    for (const element of interactiveElements) {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height || getComputedStyle(element).visibility === 'hidden') continue;
      const label = safeLabel(element.getAttribute('aria-label') || element.getAttribute('title') || element.innerText || element.textContent || '');
      if (!label.trim()) continue;
      const normalized = `${element.id} ${element.dataset.log || ''} ${label}`.toLowerCase();
      const declaredAoi = element.dataset.aoi;
      const aoi = declaredAoi || (element.getAttribute('role') === 'alert'
        ? 'AOI_blad'
        : /dostęp|dostep|accessib/.test(normalized)
          ? 'AOI_dostepnosc'
          : /wstecz|cofnij|anuluj|wróć|wroc|back|zamknij|close/.test(normalized)
            ? 'AOI_wstecz' : 'AOI_cel');
      const baseId = element.dataset.log || element.id || identifier(label);
      let key = baseId;
      let duplicate = 2;
      while (nextAois.has(key)) key = `${baseId}_${duplicate++}`;
      nextAois.set(key, {
        ekran: screenId, element: key, etykieta: label,
        x: Math.round(window.screenX + bounds.left), y: Math.round(window.screenY + bounds.top),
        szer: Math.round(bounds.width), wys: Math.round(bounds.height), aoi,
      });
    }

    for (const [key, previous] of this.activeAois) {
      if (!nextAois.has(key)) this.append({ zdarzenie: 'aoi_znika', ekran: screenId, element: previous.element, aoi: previous.aoi });
    }
    for (const [key, current] of nextAois) {
      const previous = this.activeAois.get(key);
      if (!previous || previous.etykieta !== current.etykieta || previous.x !== current.x || previous.y !== current.y || previous.szer !== current.szer || previous.wys !== current.wys) {
        this.append({ zdarzenie: 'aoi', ...current });
      }
    }
    this.activeAois = nextAois;
  }

  logTouch(aoi: StandardAOI, elementLabel: string, event: React.MouseEvent | MouseEvent | React.TouchEvent, screenId: string, _metadata?: Record<string, unknown>) {
    const hasPointer = 'clientX' in event || ('touches' in event && event.touches.length > 0) || ('changedTouches' in event && event.changedTouches.length > 0);
    const hasTarget = 'currentTarget' in event && event.currentTarget instanceof HTMLElement;
    if (!hasPointer && !hasTarget) return;

    let clientX = 0;
    let clientY = 0;
    if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const target = 'currentTarget' in event ? event.currentTarget : null;
    const element = target instanceof HTMLElement ? target : null;
    const bounds = element?.getBoundingClientRect();
    const rect = bounds;
    const label = safeLabel(element?.getAttribute('aria-label') || elementLabel);
    this.append({
      zdarzenie: 'dotkniecie', ekran: screenId,
      element: element?.dataset.log || element?.id || identifier(label), etykieta: label,
      x: Math.round(window.screenX + clientX), y: Math.round(window.screenY + clientY),
      szer: rect ? Math.round(rect.width) : '', wys: rect ? Math.round(rect.height) : '',
      trafienie: aoi === 'AOI_tlo' ? 0 : 1,
      aoi: aoi === 'AOI_tlo' ? '' : aoi,
      opis: 'touch',
    });
  }

  logError(errorMessage: string, screenId: string, metadata?: Record<string, unknown>) {
    this.append({ zdarzenie: 'blad', ekran: screenId, element: 'blad', etykieta: safeLabel(errorMessage), aoi: 'AOI_blad', opis: metadata ? JSON.stringify(metadata) : '' });
  }

  markCompleted(success = 1) {
    if (this.taskStart === null || this.taskCompleted) return;
    this.taskCompleted = true;
    this.append({ zdarzenie: 'scenariusz_koniec', sukces: success });
  }

  getMetrics(): SessionMetrics {
    const taskLogs = this.taskStart === null
      ? this.logs
      : this.logs.filter((entry) => entry.czas_epoch_ms >= this.taskStart!);
    const completedDuration = taskLogs.findLast((entry) => entry.zdarzenie === 'scenariusz_koniec')?.czas_ms;
    const totalTouches = taskLogs.filter((entry) => entry.zdarzenie === 'dotkniecie').length;
    return {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      participantId: this.participantId,
      durationSeconds: Math.round((Number(completedDuration) || (Date.now() - (this.taskStart ?? this.sessionStart))) / 1000),
      totalTouches,
      targetTouches: taskLogs.filter((entry) => entry.zdarzenie === 'dotkniecie' && entry.aoi === 'AOI_cel').length,
      missTouches: taskLogs.filter((entry) => entry.zdarzenie === 'dotkniecie' && entry.trafienie === 0).length,
      backReturns: taskLogs.filter((entry) => entry.zdarzenie === 'dotkniecie' && entry.aoi === 'AOI_wstecz' && entry.trafienie === 1).length,
      errorCount: taskLogs.filter((entry) => entry.zdarzenie === 'blad').length,
      accessibilityToggled: taskLogs.filter((entry) => entry.zdarzenie === 'dotkniecie' && entry.aoi === 'AOI_dostepnosc').length,
      isCompleted: this.taskCompleted,
    };
  }

  getLogs() { return [...this.logs]; }

  exportCSV() {
    const escape = (value: string | number) => {
      const text = String(value);
      return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const rows = this.logs.map((entry) => CSV_HEADERS.map((header) => escape(entry[header])).join(';'));
    return [CSV_HEADERS.join(';'), ...rows].join('\r\n');
  }

  exportJSON() { return JSON.stringify({ metrics: this.getMetrics(), events: this.logs }, null, 2); }

  downloadCSV(filename = this.getCsvFilename()) {
    this.download(filename, `\uFEFF${this.exportCSV()}`, 'text/csv;charset=utf-8;');
  }

  getCsvFilename() {
    return `PUN_zdarzenia_I${this.interfaceCode.padStart(2, '0')}_${this.participantId}_${this.version}.csv`;
  }

  downloadJSON(filename = `PUN_zdarzenia_I${this.interfaceCode.padStart(2, '0')}_${this.participantId}_${this.version}.json`) {
    this.download(filename, this.exportJSON(), 'application/json;charset=utf-8;');
  }

  private download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  resetSession() {
    this.logs = [];
    this.activeAois.clear();
    this.sessionId = this.createSessionId();
    this.sessionStart = Date.now();
    this.taskStart = null;
    this.taskCompleted = false;
    this.logSession();
    this.recordCurrentScreen();
  }
}

export const eventLogger = new EventLogger();
