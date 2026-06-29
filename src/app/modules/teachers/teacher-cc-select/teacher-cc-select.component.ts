import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component, effect, forwardRef, inject, input, Input, OnDestroy, OnInit
} from '@angular/core';
import { Teacher } from '@core/models/interface';
import { firstValueFrom, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UserService } from '@modules/users/user.service';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Util } from '@core/util/util';
import { TranslatePipe } from '@ngx-translate/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { map } from 'rxjs/operators';
import { Button } from '@ui/button/button';

@Component({
  selector: 'app-teacher-cc-select',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    TranslatePipe,
    TitleCasePipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    AsyncPipe,
    Button,
  ],
  providers: [
    TranslatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TeacherCcSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './teacher-cc-select.component.html',
  styleUrl: './teacher-cc-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherCcSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private userService = inject(UserService);
  private translatePipe = inject(TranslatePipe);
  private cdr = inject(ChangeDetectorRef);
  public teachers: Teacher[] = [];
  public control = new FormControl();
  public objectCompare = Util.objectCompare;
  public noItemsMessage = 'No teachers found';
  public destroy$: Subject<void> = new Subject<void>();
  public filteredOptions!: Observable<Teacher[]>;

  private _schoolId: number | null = null;
  get schoolId(): number | null {
    return this._schoolId;
  }
  @Input()
  set schoolId(value: number | null) {
    this._schoolId = value;
    if (!value) {
      return;
    }
    this.getTeachers().then();
  }

  @Input() all = false;
  @Input() classHash = '';

  data = input<Partial<Teacher>>();

  private onChangeFn: (value: Teacher | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

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
      this.change(data);
    }
  }

  change(user: Teacher) {
    if (!user) {
      this.control.reset();
    }
    this.control.setValue(user, { emitEvent: false });
    this.onChangeFn(user || null);
  }

  displayFn(teacher: Teacher, abbrev = true) {
    const { fullName, cc } = teacher || {};
    if (!fullName || !cc) {
      return '';
    }
    let ccName = `${ cc.name || '' }`;
    if (abbrev && ccName.length > 20) {
      ccName = ccName.substring(0, 20) + '...';
    }
    return `${ ccName } - ${ fullName }`;
  }

  // private _filter(value: string | Teacher): Teacher[] {
  //   if (typeof value !== 'string') {
  //     return this.teachers.slice() as Teacher[];
  //   }
  //   const filterValue = (value || '').toLowerCase().trim();
  //   if (!filterValue) {
  //     return this.teachers.slice() as Teacher[];
  //   }
  //   return this.teachers.filter(item => {
  //     const query = this.displayFn(item, false);
  //     return Util.toCompare(query).includes(Util.toCompare(filterValue));
  //   });
  // }

  async getTeachers() {
    if (!this.all && !this.schoolId && !this.classHash) {
      return;
    }
    let request;
    if (this.classHash) {
      request = this.userService.getTeachersCCByClassHash(this.classHash);
    }
    else {
      request = this.userService.getTeachersCCBySchool(this.schoolId || 0);
    }

    this.teachers = await firstValueFrom(request);

    this.cdr.detectChanges();
    if (!this.data() && this.teachers.length === 1) {
      this.change(this.teachers[0]);
    }

    this.cdr.detectChanges();
  }

  private filterTeachers(value: string | Teacher | null): Teacher[] {
    if (!value) {
      return Object.assign([], this.teachers);
    }
    const searchValue = typeof value === 'string'
      ? value.toLowerCase()
      : [value.cc?.name || '', value.fullName || ''].join(' ').toLowerCase()?? '';

    return this.teachers.filter(item =>
      [item.cc?.name || '', item.fullName || ''].join(' ').toLowerCase().includes(searchValue) ||
      String(item.id ?? '').includes(searchValue)
    );
  }

  async ngOnInit() {

    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: unknown) => {
      if (!value) {
        this.onChangeFn(null);
        // this.setDisabledState(false);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as Teacher);
        // this.setDisabledState(true);
      }
    });

    if (this.classHash) {
      await this.getTeachers();
    }

    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(' '),
      map(value => this.filterTeachers(value))
    );

    let noItemsMessage = this.noItemsMessage;
    if (!this.all && !this.schoolId) {
      noItemsMessage = 'Select a school';
    }
    else if (this.schoolId) {
      noItemsMessage = 'No teachers found for the selected school';
    }
    this.noItemsMessage = this.translatePipe.transform(noItemsMessage);

  }

  // ControlValueAccessor implementation
  writeValue(value: Teacher | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: Teacher | null) => void): void {
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
    if (typeof this.control.value === 'string') {
      this.control.setValue(null);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
