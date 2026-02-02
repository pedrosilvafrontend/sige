import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { Field } from '@ui/field/field';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ConfigService } from '@modules/config/config/config.service';
import { ConfigData, ConfigResponse } from '@models/config.model';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '@modules/users/user.service';
import { Datepicker } from '@ui/field/datepicker/datepicker';
import { JsonPipe } from '@angular/common';
import { UserSchoolAssociation } from '@models';
import { firstValueFrom } from 'rxjs';
import { FormValidators } from '@form';
import { Button } from '@ui/button/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    PageHeaderComponent,
    Field,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    Datepicker,
    JsonPipe,
    Button,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigComponent implements OnInit {
  private configService = inject(ConfigService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  isLoading = false;
  configs!: ConfigResponse;
  user = this.userService.user;
  userSchoolAssociation: UserSchoolAssociation = {
    id: 0,
    userId: 0,
    schoolId: 0,
    associationId: 0,
  };

  form = this.fb.group({
    school: this.getFormGroup('school'),
    association: this.getFormGroup('association'),
  });

  getFormGroup(group: 'school' | 'association', data?: ConfigData) {
    const form = this.fb.group({
      id: this.fb.control<number | null>(data?.id|| null),
      schoolId: this.fb.control<number | null>((group === 'school' && data?.schoolId) || null),
      associationId: this.fb.control<number | null>((group === 'association' && data?.associationId) || null),
      startFirstSemester: this.fb.control<string | null>(data?.startFirstSemester || ''),
      endFirstSemester: this.fb.control<string | null>(data?.endFirstSemester || ''),
      startSecondSemester: this.fb.control<string | null>(data?.startSecondSemester || ''),
      endSecondSemester: this.fb.control<string | null>(data?.endSecondSemester || ''),
      maxDayTests: this.fb.control<number | null>(data?.maxDayTests || null),
      maxDayWorks: this.fb.control<number | null>(data?.maxDayWorks || null),
    }, { validators: [
      FormValidators.dateRange('startFirstSemester', 'endFirstSemester'),
      FormValidators.dateRange('startSecondSemester', 'endSecondSemester'),
      ] });

    if (group === 'association' && !['admin', 'association'].includes(this.user?.role || '')) {
      form.disable();
    }

    return form;
  }

  showNotification(
    colorName: string,
    text: string,
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      panelClass: colorName,
    });
  }

  submit(groupName: string) {
    console.log(this.form.value);
    const data = (this.form.get(groupName)?.value || {}) as ConfigData;
    if (this.form.invalid) {
      return;
    }
    this.configService.update(data).subscribe({
      next: () => {
        this.showNotification('snackbar-success', 'Configurações atualizadas com sucesso');
        this.loadData().then();
      },
    })
  }

  async loadData() {
    this.isLoading = true;

    const [userSchoolAssociation] = await firstValueFrom(this.userService.getSchoolOrAssociation()) || [];
    if (userSchoolAssociation?.userId) {
      this.userSchoolAssociation = userSchoolAssociation;
    }

    const { schoolId, associationId } = this.userSchoolAssociation;
    const configs = await firstValueFrom(this.configService.getConfig({ schoolId, associationId }));


    if (configs) {
      this.configs = configs;
      this.form.patchValue(configs);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.loadData().then();
  }

}

export interface IConfigForm {
  id?: FormControl<number | null>;
  schoolId: FormControl<number | null>;
  associationId: FormControl<number | null>;
  key: FormControl<string | null>;
  value: FormControl<string | null>;
}
