import { Directive, Inject, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateFormat, DateDisplay, DateParse } from './custom-date-format';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

export const MONTH_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',        // Value shown in the input box
    monthYearLabel: 'MMM yyyy',   // Header inside calendar dropdown
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Directive({
  selector: '[datePickerFormat]',
  providers: [
    provideDateFnsAdapter(),
    {
      provide: MAT_DATE_FORMATS,
      useClass: CustomDateFormat
    }
  ]
})
export class DatePickerFormatDirective {
  @Input() public configDateParse!: DateParse;
  @Input() public configDateDisplay!: DateDisplay;

  @Input('datePickerFormat')
  set datePickerFormat(format: string) {
    if (this.configDateParse) {
      this.matDateFormat.updateDateFormat(
        this.configDateParse,
        this.configDateDisplay
      );
    } else {
      this.matDateFormat.updateDateFormat({dateInput: format});
    }
    // We need this for the first time to tell component change new format
    const value = this.ngControl.value;
    this.ngControl.valueAccessor?.writeValue(value);
  }

  constructor(
    @Inject(MAT_DATE_FORMATS) public matDateFormat: CustomDateFormat,
    @Optional() private ngControl: NgControl
  ) {
  }
}
