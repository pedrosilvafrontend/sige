import { EvaluationCriterion } from '@models/evaluation';

export interface Work {
  id: number;
  score: string;
  local: string;
  evaluationCriteria: string;
  // evaluations: EvaluationCriterion[];
  description: string;
}

export class Work {
  constructor(work: Partial<Work> = {}) {
    {
      this.id = work.id || 0;
      this.score = work.score || '';
      this.local = work.local || '';
      this.evaluationCriteria = work.evaluationCriteria || '';
      this.description = work.description || '';
    }
  }
}
