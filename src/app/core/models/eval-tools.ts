import { Test } from './test';
import { Work } from '@models/work';
import { FormGroup } from '@angular/forms';
import { IWorkForm } from '@form/work.form';
import { IProofForm } from '@form/proof.form';

export interface EvalTools {
  proof?: Test;
  work?: Work;
}

export interface EvalToolsForm {
  proof?: FormGroup<IProofForm>;
  work?: FormGroup<IWorkForm>;
}

export class EvalTools {
  constructor(evalTools: Partial<EvalTools> = {}) {
    {
      this.proof = evalTools.proof || new Test();
      this.work = evalTools.work || new Work();
    }
  }
  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
