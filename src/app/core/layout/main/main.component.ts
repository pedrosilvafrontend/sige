import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '@ui/menu/menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';

@Component({
  selector: 'app-admin',
  imports: [
    CdkMenuModule,
    RouterOutlet,
    MenuComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
}
