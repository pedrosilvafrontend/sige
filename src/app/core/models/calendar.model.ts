import { formatDate } from '@angular/common';
import { LessonBatch } from '@models';
import { format } from 'date-fns';

export class Calendar {
  id?: string;
  title: string;
  groupId: string;
  startDate: string;
  endDate: string;
  details: string;
  lesson?: Partial<LessonBatch>;

  constructor(calendar: Calendar) {
    {
      this.id = calendar.id || '';
      this.title = calendar.title || '';
      this.groupId = calendar.groupId || '';
      this.startDate = format(new Date(), 'yyyy-MM-dd') || '';
      this.endDate = format(new Date(), 'yyyy-MM-dd') || '';
      this.details = calendar.details || '';
      this.lesson = calendar.lesson || {};
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}

