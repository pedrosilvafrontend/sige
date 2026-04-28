import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, AbstractControl, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class DynamicForm {

  private fb = inject(FormBuilder);

  // addControlByPath(rootForm: FormGroup, path: string, initialValue: any = '') {
  //   const parts = path.split('.');
  //   const controlName = parts.pop()!;
  //   let currentGroup = rootForm;
  //
  //   parts.forEach(part => {
  //     if (!currentGroup.get(part)) {
  //       currentGroup.addControl(part, this.fb.group({}));
  //     }
  //     currentGroup = currentGroup.get(part) as FormGroup;
  //   });
  //
  //   if (!currentGroup.get(controlName)) {
  //     currentGroup.addControl(controlName, new FormControl(initialValue));
  //   }
  // }

  addControlByPath(rootForm: FormGroup, path: string, initialValue: any = '') {
    const parts = path.split('.');
    let current: AbstractControl = rootForm;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const isLast = i === parts.length - 1;
      const nextIsNumber = nextPart !== undefined && !isNaN(Number(nextPart));

      if (isLast) {
        this.ensureControl(current, part, new FormControl(initialValue), true);
      } else {
        // Se a próxima chave for número, precisamos de um FormArray
        const nextControl = nextIsNumber ? this.fb.array([]) : this.fb.group({});
        this.ensureControl(current, part, nextControl, false);

        // Move para o próximo nível (Group ou Array)
        current = (current as any).get(part);
      }
    }
  }

  private ensureControl(parent: AbstractControl, key: string, control: AbstractControl, isLast: boolean) {
    if (parent instanceof FormGroup) {
      if (!parent.get(key)) {
        parent.addControl(key, control);
      }
    } else if (parent instanceof FormArray) {
      const index = Number(key);
      const fillControl = () => isLast ? this.fb.control(null as any) : this.fb.group({});
      const fillAt = isLast ? index : index + 1;
      // Preenche o array com grupos vazios se o índice solicitado for maior que o tamanho atual
      while (parent.length < fillAt) {
        parent.push(fillControl());
      }
      if (isLast) {
        parent.push(control);
      }
    }
  }

}
