import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  Input,
  numberAttribute,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { Util } from '@core/util/util';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, startWith, Subject, takeUntil } from 'rxjs';
import { ClassesService } from '@services';
import { SchoolClass } from '@models';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { TitleCasePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-class-select',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    TitleCasePipe,
    TranslateModule,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    MatAutocomplete
  ],
  providers: [
    TranslatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClassSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './class-select.component.html',
  styleUrl: './class-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private classesService = inject(ClassesService);
  private translatePipe = inject(TranslatePipe);
  public classes: SchoolClass[] = [];
  public objectCompare = Util.objectCompare;
  public noItemsMessage = 'No classes found';
  public showSchool = input(false);
  public control = new FormControl();
  public filteredOptions: SchoolClass[] = [];
  public destroy$: Subject<void> = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  // ControlValueAccessor hooks
  private onChangeFn: (value: SchoolClass | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  private _schoolId: number | null = null;
  get schoolId(): number | null {
    return this._schoolId;
  }
  @Input({transform: numberAttribute})
  set schoolId(value: number | null) {
    this._schoolId = value;
    if (!value) {
      return;
    }
    this.getClasses().then();
  }

  private _degreeId: string = '';
  get degreeId(): string {
    return this._degreeId;
  }
  @Input()
  set degreeId(value: string) {
    this._degreeId = value;
    this.filteredOptions = this._filter(this.control.value);
    this.checkSelected();
  }

  @Input() all = false;

  checkSelected() {
    if (!this.filteredOptions.length) {
      return;
    }
    if (typeof this.control.value === 'object') {
      const selected = this.control.value as SchoolClass;
      if (selected && (selected.school?.id !== this.schoolId || selected.degreeId !== this.degreeId)) {
        this.control.setValue(null);
        return;
      }
    }
  }

  displayFn(schoolClass: SchoolClass) {
    return schoolClass?.code ? schoolClass.code : '';
  }

  private _filter(value: string | SchoolClass): SchoolClass[] {
    const classes = this.degreeId
      ? this.classes.filter(item => item.degreeId === this.degreeId)
      : this.classes.slice() as SchoolClass[];

    if (typeof value !== 'string') {
      return classes.slice() as SchoolClass[];
    }
    const filterValue = (value || '').toLowerCase().trim();
    if (!filterValue) {
      return classes.slice() as SchoolClass[];
    }
    return classes.filter(item => {
      const codeName = (item.code || '').toLowerCase();
      return (codeName).toLowerCase().includes(filterValue)
    });
  }

  async getClasses() {
    if (!this.all && !this.schoolId) {
      return;
    }
    const response = await firstValueFrom(this.classesService.getAll(this.schoolId || null));
    this.classes = response.data;
    this.cdr.detectChanges();

    this.control.valueChanges.pipe(
      takeUntil(this.destroy$),
      startWith(''),
      map(value => this._filter(value || '')),
    ).subscribe(classes => {
      this.filteredOptions = classes;
      if (this.classes.length === 0) {
        this.noItemsMessage = 'No classes found';
      } else {
        this.noItemsMessage = 'No classes found for the selected school';
      }
    })
  }

  async ngOnInit() {

    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: unknown) => {
      if (!value) {
        this.onChangeFn(null);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as SchoolClass);
      }
    });

    let noItemsMessage = this.noItemsMessage;
    if (!this.all && !this.schoolId) {
      noItemsMessage = 'Select a school';
    }
    else if (this.schoolId) {
      noItemsMessage = 'No classes found for the selected school';
    }
    this.noItemsMessage = this.translatePipe.transform(noItemsMessage);
  }

  // ControlValueAccessor implementation
  writeValue(value: SchoolClass | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: SchoolClass | null) => void): void {
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
    this.destroy$.next();
    this.destroy$.complete();
  }

}
