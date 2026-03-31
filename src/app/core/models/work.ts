import { LessonBatch } from '@models/lesson.model';

export interface Work {
  id: number;
  lessonId: number;
  lesson: LessonBatch;
  timeScheduleId: number;
  date: string;
  score: string;
  local: string;
  evaluationCriteria: string;
  // evaluations: EvaluationCriterion[];
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Work {
  constructor(work: Partial<Work> = {}) {
    {
      this.id = work.id || 0;
      this.lessonId = work.lessonId || 0;
      this.timeScheduleId = work.timeScheduleId || 0;
      this.date = work.date || '';
      this.score = work.score || '';
      this.local = work.local || '';
      this.evaluationCriteria = work.evaluationCriteria || '';
      this.description = work.description || '';
      this.status = work.status || '';
      this.createdAt = work.createdAt || '';
      this.updatedAt = work.updatedAt || '';
    }
  }

  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
