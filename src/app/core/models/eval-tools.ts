import { Proof } from '@models/proof';
import { Work } from '@models/work';
import { FormGroup } from '@angular/forms';
import { IWorkForm } from '@form/work.form';
import { IProofForm } from '@form/proof.form';

export interface EvalTools {
  proof?: Proof;
  work?: Work;
}

export interface EvalToolsForm {
  proof?: FormGroup<IProofForm>;
  work?: FormGroup<IWorkForm>;
}

export class EvalTools {
  constructor(evalTools: Partial<EvalTools> = {}) {
    {
      this.proof = evalTools.proof || new Proof();
      this.work = evalTools.work || new Work();
    }
  }
  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
