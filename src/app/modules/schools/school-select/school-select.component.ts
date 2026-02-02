import {
  ChangeDetectorRef,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { Util } from '@core/util/util';
import { School } from '@models';
import { SchoolsService } from '@services/schools.service';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-school-select',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatAutocompleteModule,
    MatInputModule,
    TranslateModule,
    TitleCasePipe,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  providers: [
    TranslatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SchoolSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './school-select.component.html',
  styleUrl: './school-select.component.scss'
})
export class SchoolSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private translatePipe = inject(TranslatePipe);
  public control = new FormControl();
  private cdr = inject(ChangeDetectorRef);
  // public form = SchoolForm.form(undefined, true);
  public objectCompare = Util.objectCompare;
  public schools: School[] = [];
  private schoolsService = inject(SchoolsService);
  public destroy$: Subject<void> = new Subject<void>();
  public filteredOptions!: Observable<School[]>;
  data = input<Partial<School>>({});

  // @Input() disabled = false;
  @Input() getParams!: Record<string, string|number|boolean>;
  @Input() noItemsMessage!: string;
  // ControlValueAccessor hooks
  private onChangeFn: (value: School | null) => void = () => {};
  private onTouchedFn: () => void = () => {};
  // @Input()
  // set required(required: boolean) {
  //   const action = required ? 'addValidators' : 'removeValidators';
  //   this.form.controls.id[action]([Validators.required])
  // }

  // @Output()
  // public form$ = new BehaviorSubject(this.form);

  // @Output() change$ = new Subject<School>();

  constructor() {
    effect(() => {
      if (this.data()) {
        this.onInputData();
      }
    });
  }

  onInputData() {
    const data = this.data();
    if (data) {
      this.change(data as School);
    }
  }

  displayFn(school: School) {
    return school?.acronym ? school.acronym + ' - ' + school.name : '';
  }

  private _filter(value: string | School): School[] {
    if (typeof value !== 'string') {
      return this.schools.slice() as School[];
    }
    const filterValue = (value || '').toLowerCase().trim();
    if (!filterValue) {
      return this.schools.slice() as School[];
    }
    return this.schools.filter(item => {
      const searchName = ((item.acronym || '') + ' - ' + (item.name || '')).toLowerCase();
      return (searchName).toLowerCase().includes(filterValue)
    });
  }

  async getSchools() {
    this.schools = await firstValueFrom(this.schoolsService.getAll(this.getParams));
    this.cdr.detectChanges();
    if (!this.data()?.id && this.schools.length === 1) {
      this.change(this.schools[0]);
    }

    if (!this.filteredOptions) {
      this.filteredOptions = this.control.valueChanges.pipe(
        takeUntil(this.destroy$),
        startWith(''),
        map(value => this._filter(value || '')),
      );
    } else {
      this.control.setValue(null);
    }
  }

  async ngOnInit() {
    await this.getSchools();

    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: any) => {
      if (!value) {
        this.onChangeFn(null);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as School);
      }
    })

    let noItemsMessage = '';
    if (Object.keys(this.getParams).length === 1 && this.getParams['class'] === true) {
      noItemsMessage = this.translatePipe.transform('No schools found with classes');
    }
    else {
      noItemsMessage = this.translatePipe.transform('No schools found with the given parameters');
    }
    this.noItemsMessage = this.translatePipe.transform(noItemsMessage);
  }

  change(school: School) {
    if (!school) {
      this.control.reset();
    }
    this.control.setValue(school, { emitEvent: false });
    this.onChangeFn(school || null);
  }

  // ControlValueAccessor implementation
  writeValue(value: School | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: School | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    const action = isDisabled ? 'disable' : 'enable';
    this.control[action]();
  }

  handleBlur(): void {
    this.onTouchedFn();
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }

}
