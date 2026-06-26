import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@ui/menu/menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Footer } from '@core/layout/footer/footer';

@Component({
  selector: 'app-admin',
  imports: [
    CdkMenuModule,
    RouterOutlet,
    MenuComponent,
    Footer,
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main.component.scss'
})
export class MainComponent {
}
