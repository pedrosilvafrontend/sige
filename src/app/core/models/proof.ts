export interface Proof {
  id: number;
  lessonId: number;
  timeScheduleId: number;
  date: string;
  title: string;
  content: string;
  whereToFindIt: string;
  score: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Proof {
  constructor(proof: Partial<Proof> = {}) {
    {
      this.id = proof.id || 0;
      this.lessonId = proof.lessonId || 0;
      this.timeScheduleId = proof.timeScheduleId || 0;
      this.date = proof.date || '';
      this.title = proof.title || '';
      this.content = proof.content || '';
      this.whereToFindIt = proof.whereToFindIt || '';
      this.score = proof.score || '';
      this.status = proof.status || '';
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
