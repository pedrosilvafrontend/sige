import { Component } from '@angular/core';
import { BaseModal } from '@modules/modals/base-modal/base-modal';
import { GeneralEvent } from '@models';
import { Button } from '@ui/button/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { ModalComponent } from '@ui/modal/modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { JsonPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-general-event-modal',
  imports: [
    Button,
    TranslatePipe,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    ModalComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    TitleCasePipe,
    JsonPipe
  ],
  templateUrl: './general-event-modal.html',
  styleUrl: './general-event-modal.scss',
})
export class GeneralEventModal extends BaseModal<GeneralEvent> {
  private fb = new FormBuilder();
  types = Object.values(GeneralEvent.types);

  constructor() {
    super();
    this.data = new GeneralEvent();
    this.setForm();
  }

  setForm() {
    this.form = this.fb.group({
      id: [0],
      type: [null, Validators.required],
    });
  }

  onSubmit() {
    console.log('>>> Form submitted:', this.form.value);
  }
}
