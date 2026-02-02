import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input } from '@angular/core';
import { BaseSelect } from '@ui/base-select/base-select';
import { SchoolClass, TimeSchedule } from '@models';
import { TimeScheduleService } from '@services/time-schedule.service';
import { firstValueFrom } from 'rxjs';
import { Util } from '@util/util';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-time-schedule-select',
  imports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    ReactiveFormsModule,
    TitleCasePipe,
    TranslatePipe
  ],
  templateUrl: './time-schedule-select.html',
  styleUrl: './time-schedule-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeScheduleSelect),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeScheduleSelect extends BaseSelect<TimeSchedule> {
  private timeScheduleService = inject(TimeScheduleService);

    schoolClass = input({} as Partial<SchoolClass>);

    constructor() {
      super();

      effect(() => {
        if (this.schoolClass()?.school?.id) {
          this.getData(this.schoolClass()).then();
        } else {
          this.data.length = 0;
        }
      });
    }

    override async getData(classData: Partial<SchoolClass>) {
      const params = {
        schoolId: classData?.school?.id,
        degreeId: classData?.degreeId,
        dayShiftId: classData?.dayShiftId
      }
      const response = await firstValueFrom(this.timeScheduleService.getAll(params));
      this.data = response || [];
    }

    override filter(value: string | TimeSchedule): TimeSchedule[] {

      if (typeof value !== 'string') {
        return this.data.slice();
      }

      const filterValue = (value || '').toLowerCase().trim();
      if (!filterValue) {
        return this.data.slice();
      }
      return this.data.filter(item => {
        return Util.toCompare(`${item.startTime} - ${item.endTime}`).includes(Util.toCompare(value));
      });
    }

    override displayFn(item: TimeSchedule): string {
      return item ? `${item.startTime} - ${item.endTime}` : '';
    }

}
