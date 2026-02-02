export interface EvaluationCriterion {
  id: number;
  code: string;
  description: string;
  items: EvaluationItem[];
  position: number;
  deft: boolean;
}

export interface EvaluationItem {
  id: number;
  criterionCode: string;
  criterion?: EvaluationCriterion;
  score: string;
  description: string;
  position: number;
  deft: boolean;
}
