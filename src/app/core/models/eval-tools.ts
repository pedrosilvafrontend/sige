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
