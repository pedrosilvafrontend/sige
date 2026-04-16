export interface GeneralEvent {
  id: number;
  timeScheduleId: number;
  date: string;
  title: string;
  description: string;
  type: GeneralEventType
}

export type GeneralEventType = 'PROOF' | 'WORK' | 'EVENT';

export class GeneralEvent {
  constructor(event: Partial<GeneralEvent> = {}) {
    this.id = event.id || 0;
    this.timeScheduleId = event.timeScheduleId || 0;
    this.date = event.date || '';
    this.title = event.title || '';
    this.description = event.description || '';
    this.type = event.type || 'EVENT';
  }

  static types = {
    'PROOF': 'proof',
    'WORK': 'work',
    'EVENT': 'event'
  }
}
