import { DayShifts } from '../config/day-shifts/day-shifts.model';

export class EventCategory {
  id!: string;
  name: string;
  constructor(item: Partial<DayShifts> = {}) {
    {
      this.name = item.name || '';
    }
  }
}
