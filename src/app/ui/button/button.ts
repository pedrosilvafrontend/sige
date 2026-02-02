import { booleanAttribute, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-button',
  imports: [
    MatButtonModule,
    MatIconModule,
    NgClass
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss'
})
export class Button {
  type = input<string>('button');
  ariaLabel = input<string>('');
  href = input<string>('');
  disabled = input(false, { transform: booleanAttribute });
  icon = input<string>('');
  fabIcon = input<string>('');
  color = input<string>('primary');
  size = input<string>('normal');
  onClick = output<void>();

  btnClick() {
    this.onClick.emit();
  }
}
