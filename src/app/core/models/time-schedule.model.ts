export interface TimeSchedule {
  id: number;
  schoolId: number;
  associationId: number;
  dayShiftId: string;
  degreeId: string;
  sequence: number;
  startTime: string;
  endTime: string;
}

export class TimeSchedule {
  id: number;
  schoolId: number;
  associationId: number;
  dayShiftId: string;
  degreeId: string;
  sequence: number;
  startTime: string;
  endTime: string;

  constructor(data: Partial<TimeSchedule> = {}) {
    this.id = data?.id || 0;
    this.schoolId = data?.schoolId || 0;
    this.associationId = data?.associationId || 0;
    this.dayShiftId = data?.dayShiftId || '';
    this.degreeId = data?.degreeId || '';
    this.sequence = data?.sequence || 0;
    this.startTime = data?.startTime || '';
    this.endTime = data?.endTime || '';
  }
}
