import { UniqueLessonEvent } from '@models/event';

export type ProofType = 'TEST' | 'MULTICLASS_TEST' | 'TEST_OF_OVERCOMING'

export interface Proof {
  id: number;
  type: ProofType;
  schoolId: number;
  lessonId: number;
  timeScheduleId: number;
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
  curricularComponentId?: number;
}

export class Proof {
  constructor(proof: Partial<Proof> = {}) {
    {
      this.id = proof.id || 0;
      this.type = proof.type || 'TEST';
      this.lessonId = proof.lessonId || 0;
      this.schoolId = proof.schoolId || 0;
      this.timeScheduleId = proof.timeScheduleId || 0;
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
      this.curricularComponentId = proof.curricularComponentId || 0
    }
  }

  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
