import {
  AfterContentChecked,
  AfterContentInit, AfterViewInit,
  Component,
  ContentChild,
  ElementRef, Inject,
  inject, input,
  output, TemplateRef, ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ui-modal-dialog',
  imports: [
    MatDialogModule,
    MatButton,
    NgTemplateOutlet
  ],
  template: `
    <ng-template #confirm>
      <h2 mat-dialog-title>Confirmação</h2>
      <mat-dialog-content>
        Deseja relmente excluír?
      </mat-dialog-content>
      <mat-dialog-actions>
        <button matButton mat-dialog-close>Sim</button>
        <button matButton mat-dialog-close cdkFocusInitial>Não</button>
      </mat-dialog-actions>
    </ng-template>

    @if (data.type === 'confirm') {
      <ng-template [ngTemplateOutlet]="data.template || confirm" />
    } @else {
      <ng-template [ngTemplateOutlet]="data.template" />
    }
  `,
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ModalDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {template: TemplateRef<any>, type?: 'confirm' | 'alert'}
  ) {
  }
}

@Component({
  selector: 'ui-modal',
  imports: [],
  template: ``,
})
export class ModalComponent {
  private dialog = inject(MatDialog);
  private _ref!: MatDialogRef<ModalDialogComponent>;
  public template = input<TemplateRef<any>>();
  public options = input<any>({})

  get ref(): MatDialogRef<ModalDialogComponent> {
    return this._ref;
  }
  set ref(value: MatDialogRef<ModalDialogComponent>) {
    this._ref = value;
  }

  get close (): () => void {
    return this.ref?.close.bind(this.ref) || (() => {});
  }

  open(): void {
    if (this.ref) {
      this.ref.close();
    }
    const options = this.options();
    const template = this.template();
    this.ref = this.dialog.open(ModalDialogComponent, {
      ...options,
      data: {
        ...(options.data || {}),
        template
      }
    });
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}
