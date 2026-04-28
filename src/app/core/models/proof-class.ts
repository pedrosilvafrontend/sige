import { UniqueLessonEvent } from '@models/event';

export interface ProofClass {
  id: number;
  proofId: number;
  classId: number;
}

export class ProofClass {
  constructor(proofClass: Partial<ProofClass> = {}) {
    {
      this.id = proofClass.id || 0;
      this.proofId = proofClass.proofId || 0;
      this.classId = proofClass.classId || 0;
    }
  }
}
