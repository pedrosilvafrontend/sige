import { Component, EventEmitter, inject, Inject, Output } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormArray } from '@angular/forms';
import { SchoolListComponent } from '@modules/schools/school-list/school-list.component';
import { School } from '@models';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-school-list-select',
  standalone: true,
  imports: [
    SchoolListComponent,
    MatDialogClose,
    MatDialogContent,
    MatIcon,
    MatIconButton,
    TranslateModule,
    MatButton
  ],
  templateUrl: './school-list-select.component.html',
  styleUrl: './school-list-select.component.scss'
})
export class SchoolListSelectComponent {
  private fb = inject(FormBuilder);
  public data = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<SchoolListSelectComponent>);

  public form: UntypedFormArray = this.createForm();
  @Output()
  public form$ = new EventEmitter<FormArray>();

  constructor() {
    if (this.data.form) {
      this.form = this.data.form as FormArray;
    }
    this.form$.next(this.form);
  }

  createForm() {
    return this.fb.array([]);
  }

  close(selecteds: School[]) {
    for (let i = this.form.length; i >= 0; i--) {
      this.form.removeAt(i)
    }
    (selecteds || []).forEach((school: School) => {
      const { id, name, acronym } = school;
      this.form.push(this.fb.group({ id, name, acronym }))
    })
    this.dialogRef.close(selecteds);
  }
}
