import {
  Component,
  Inject,
  inject, input, OnInit,
  output, TemplateRef, ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { NgTemplateOutlet } from '@angular/common';

export interface ModalOutput<T = any> {
  open: (data?: T) => MatDialogRef<ModalDialogComponent>;
  close: () => void;
}

@Component({
  selector: 'ui-modal-dialog',
  imports: [
    MatDialogModule,
    MatButton,
    NgTemplateOutlet
  ],
  template: `
    <ng-template #confirm>
      <div class="modalTitle">
        <h2 mat-dialog-title>Confirmação</h2>
      </div>
      <mat-dialog-content>
        Deseja relmente excluír?
      </mat-dialog-content>
      <mat-dialog-actions>
        <button matButton mat-dialog-close>Sim</button>
        <button matButton mat-dialog-close cdkFocusInitial>Não</button>
      </mat-dialog-actions>
    </ng-template>

    <div class="dialogContainer">
    @if (data.type === 'confirm') {
      <ng-template [ngTemplateOutlet]="data.template || confirm" [ngTemplateOutletContext]="data.context || {}" />
    } @else {
      <ng-template [ngTemplateOutlet]="data.template" [ngTemplateOutletContext]="data.context || {}" />
    }
    </div>
  `,
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ModalDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {template: TemplateRef<any>, type?: 'confirm' | 'alert', context?: any}
  ) {
  }
}

@Component({
  selector: 'ui-modal',
  imports: [],
  template: ``,
})
export class ModalComponent implements OnInit {
  private dialog = inject(MatDialog);
  private _ref!: MatDialogRef<ModalDialogComponent>;
  public template = input<TemplateRef<any>>();
  public options = input<any>({})
  modal = output<ModalComponent>();

  get ref(): MatDialogRef<ModalDialogComponent> {
    return this._ref;
  }
  set ref(value: MatDialogRef<ModalDialogComponent>) {
    this._ref = value;
  }

  constructor() {
    this.close = this.close.bind(this)
    this.open = this.open.bind(this)
  }

  close(dialogResult?: any) {
    this.ref?.close(dialogResult)
  }

  open(context?: any): MatDialogRef<ModalDialogComponent, any> {
    if (this.ref) {
      this.ref.close();
    }
    const options = this.options();
    const template = this.template();
    this.ref = this.dialog.open(ModalDialogComponent, {
      ...options,
      data: {
        ...(options.data || {}),
        template,
        context
      }
    });

    return this.ref;
  }

  // closeAll(): void {
  //   this.dialog.closeAll();
  // }

  ngOnInit() {
    this.modal.emit(this);
  }
}
