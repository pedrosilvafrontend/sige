import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolListComponent } from '@modules/schools/school-list/school-list.component';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';


@Component({
  selector: 'app-schools',
  standalone: true,
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.scss',
  imports: [
    CommonModule,
    SchoolListComponent,
    PageHeaderComponent
  ],
})
export class SchoolsComponent {

}
