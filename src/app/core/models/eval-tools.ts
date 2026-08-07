import { Test } from './test';
import { Work } from '@models/work';
import { FormGroup } from '@angular/forms';
import { IWorkForm } from '@form/work.form';
import { ITestForm } from '@form/proof.form';

export interface EvalTools {
  test?: Test;
  work?: Work;
}

export interface EvalToolsForm {
  proof?: FormGroup<ITestForm>;
  work?: FormGroup<IWorkForm>;
}

export class EvalTools {
  constructor(evalTools: Partial<EvalTools> = {}) {
    {
      this.test = evalTools.test || new Test();
      this.work = evalTools.work || new Work();
    }
  }
  static statusClass = {
    'PENDING_APPROVAL': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
}
