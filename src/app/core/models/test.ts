import { UniqueLessonEvent } from '@models/event';
import { CurricularComponent } from '@models/curricular-component.model';

export type ProofType = 'TEST' | 'MULTICLASS_TEST' | 'TEST_OF_OVERCOMING'

export interface Test {
  id: number;
  type: ProofType;
  schoolId: number;
  lessonId: number;
  timeScheduleId: number;
  curricularComponentId?: number;
  curricularComponent?: CurricularComponent;
  date: string;
  title: string;
  content: string;
  whereToFindIt: string;
  score: string;
  status: string;
  events: UniqueLessonEvent[];
  // tests: Proof[];
  createdAt?: string;
  updatedAt?: string;
}

export class Test {
  constructor(proof: Partial<Test> = {}) {
    {
      this.id = proof.id || 0;
      this.type = proof.type || 'TEST';
      this.lessonId = proof.lessonId || 0;
      this.schoolId = proof.schoolId || 0;
      this.timeScheduleId = proof.timeScheduleId || 0;
      this.curricularComponentId = proof.curricularComponentId || 0;
      this.curricularComponent = proof.curricularComponent || undefined;
      this.date = proof.date || '';
      this.title = proof.title || '';
      this.content = proof.content || '';
      this.whereToFindIt = proof.whereToFindIt || '';
      this.score = proof.score || '';
      this.status = proof.status || '';
      this.events = proof.events || [];
      // this.tests = proof.tests || [];
      this.createdAt = proof.createdAt || '';
      this.updatedAt = proof.updatedAt || '';
    }
  }

  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
