import { Entity } from '@core/models/interface';
import { School } from '@models/school.model';

export class SchoolClass {
  id: number | null;
  code: string | null = null;
  degreeId: string | null = null;
  yearId: string | null = null;
  suffixId: string | null = null;
  dayShiftId: string | null = null;
  school: School | undefined;
  constructor(schoolClass: Partial<SchoolClass> = {}) {
    {
      this.id = schoolClass.id || null;
      this.code = schoolClass.code || null;
      this.degreeId = schoolClass.degreeId || null;
      this.yearId = schoolClass.yearId || null;
      this.suffixId = schoolClass.suffixId || null;
      this.dayShiftId = schoolClass.dayShiftId || null;
      this.school = schoolClass.school || undefined;
    }
  }
}
