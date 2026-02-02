import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
// import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { School } from '@models';
import { DashboardService } from '@services';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { ActivitiesCount, ActivitiesCountFilters, ActivitiesCountResponse } from '@core/models/dashboard.model';
import { NgStyle } from '@angular/common';
import { ClassSelectComponent } from '@modules/classes/class-select/class-select.component';
import { SchoolSelectComponent } from '@modules/schools/school-select/school-select.component';

@Component({
  selector: 'app-activities-count',
  standalone: true,
  imports: [
    // GoogleChartsModule,
    FormsModule,
    MatCard,
    MatCardContent,
    ReactiveFormsModule,
    TranslateModule,
    NgStyle,
    ClassSelectComponent,
    SchoolSelectComponent,
  ],
  templateUrl: './activities-count.component.html',
  styleUrl: './activities-count.component.scss',
  host: {
    class: 'col'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesCountComponent implements OnInit {
  dashboardService = inject(DashboardService);
  fb = new FormBuilder();
  activitiesCount: Partial<ActivitiesCountResponse> = {};
  schools: School[] = [];
  timeFilter: any;

  chart = {
    title: '',
    // type: ChartType.Bar, // Or other chart types like LineChart, BarChart
    data: [],
    columns: ['Escola', 'Trabalhos', 'Provas'],
    options: {
      // pieHole: 0.4
      // chartArea: { width: '60%' },
      // series: {
      //   0: { color: '#1b63cf' },
      //   1: { color: '#aa3c3c' },
      // },
    },
    width: 600,
    height: 300,
  }

  filters: UntypedFormGroup = this.fb.group({
    // school: Form.school.form(undefined, true),
    // school: [null],
    schoolId: [0],
    startDate: [''],
    endDate: [''],
    activityId: [0],
    teacherId: [0],
    classId: [0],
    school: [null],
    class: [null],
    curricularComponentId: [0],
  })

  addFilterControl(name: string, control: UntypedFormGroup | UntypedFormControl | UntypedFormArray) {
    this.filters.addControl(name, control);
    this.applyFilter();
  }

  submit() {
    console.log(this.filters.value);
  }

  async ngOnInit() {
    await this.getActivitiesCount();
  }

  applyFilter() {
    this.getActivitiesCount().then();
  }

  async getActivitiesCount() {
    const filters = (this.filters.value as ActivitiesCountFilters) || {};
    const params = {
      schoolId: filters.school?.id || 0,
      classId: filters.class?.id || 0,
      curricularComponentId: filters.curricularComponent?.id || 0,
    }
    this.activitiesCount = await firstValueFrom(this.dashboardService.getActivitiesCount(params));
    const data: any = {};
    (this.activitiesCount.data || []).forEach((item: ActivitiesCount) => {
      const { school, class: classe, curricularComponent } = item;
      const pos: any = {
        WORK: 1,
        TEST: 2,
      }

      if (!params.schoolId && !params.classId && !params.curricularComponentId) {
        this.chart.columns = ['Escola', 'Trabalhos', 'Provas'];
      }

      let key = school.acronym;
      if (params.classId && curricularComponent?.id) {
        key = `${curricularComponent.name}`;
        this.chart.columns = ['Disciplina', 'Trabalhos', 'Provas'];
      }
      else if (params.schoolId && classe?.id) {
        this.chart.columns = ['Turma', 'Trabalhos', 'Provas'];
        key = `${classe?.code}`;
      }

      if (!key) return;

      if (!data[key]) {
        data[key] = [key, 0, 0];
      }
      const index = pos[item.activity.id];
      if (index) {
        data[key][index] = item.count;
      }

    });
    this.chart.data = Object.values(data);
    // console.table(this.chart.data);
    this.chart.width = (this.chart.data.length * 150) + 120;
  }

}
