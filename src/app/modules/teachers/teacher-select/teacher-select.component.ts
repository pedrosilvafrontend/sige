import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component, effect, forwardRef, inject, input, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { User } from '@core/models/interface';
import { BehaviorSubject, firstValueFrom, Observable, of, startWith, Subject, take, takeUntil } from 'rxjs';
import { UserService } from '@modules/users/user.service';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { Form } from '@form';
import { Util } from '@core/util/util';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { AsyncPipe, JsonPipe, TitleCasePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-teacher-select',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    TranslateModule,
    TitleCasePipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  providers: [
    TranslatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TeacherSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './teacher-select.component.html',
  styleUrl: './teacher-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private userService = inject(UserService);
  private translatePipe = inject(TranslatePipe);
  private cdr = inject(ChangeDetectorRef);
  public teachers: User[] = [];
  public control = new FormControl();
  public objectCompare = Util.objectCompare;
  public noItemsMessage = 'No teachers found';
  public destroy$: Subject<void> = new Subject<void>();
  public filteredOptions!: Observable<User[]>;

  private _schoolId: number | null = null;
  get schoolId(): number | null {
    return this._schoolId;
  }
  @Input()
  set schoolId(value: number | null) {
    this._schoolId = value;
    // const selectedSchoolId = this.control.value?.schoolId || 0;
    // if (!value || selectedSchoolId !== value) {
    //   this.teachers = [];
    //   this.control.reset();
    // }
    if (!value) {
      return;
    }
    this.getTeachers().then();
  }

  @Input() all = false;
  @Input() classHash = '';

  data = input<Partial<User>>();

  // @Input()
  // set disabled(disabled: boolean) {
  //   const action = disabled ? 'disable' : 'enable';
  //   this.control[action]();
  //   // this.form.controls.id[action]();
  // }
  //
  // @Input()
  // set required(required: boolean) {
  //   const action = required ? 'addValidators' : 'removeValidators';
  //   // this.form.controls.id[action]([Validators.required])
  //   this.control.setValidators(required ? [Validators.required] : []);
  // }

  // @Output() form$ = new BehaviorSubject(this.control);
  // @Output() change$ = new Subject<User>();

  // ControlValueAccessor hooks
  private onChangeFn: (value: User | null) => void = () => {};
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

  change(user: User) {
    if (!user) {
      this.control.reset();
    }
    // this.form.patchValue(user);
    this.control.setValue(user, { emitEvent: false });
    // this.change$.next(user);
    this.onChangeFn(user || null);
  }

  displayFn(user: User) {
    return user?.code ? user.code + ' - ' + user.fullName : (user?.fullName || '');
  }

  private _filter(value: string | User): User[] {
    if (typeof value !== 'string') {
      return this.teachers.slice() as User[];
    }
    const filterValue = (value || '').toLowerCase().trim();
    if (!filterValue) {
      return this.teachers.slice() as User[];
    }
    return this.teachers.filter(item => {
      const codeName = ((item.code || '') + ' - ' + (item.fullName || ''));
      return Util.toCompare(codeName).includes(Util.toCompare(filterValue));
    });
  }

  async getTeachers() {
    if (!this.all && !this.schoolId && !this.classHash) {
      return;
    }
    let request;
    if (this.classHash) {
      request = this.userService.getTeachersByClassHash(this.classHash);
    }
    else {
      request = this.userService.getTeachersBySchool(this.schoolId || 0);
    }

    // if (this.userService.user.role === 'teacher') {
    //   const teachers = [];
    //   if (this.control.value && typeof this.control.value === 'object') {
    //     teachers.push(this.control.value);
    //   }
    //   this.teachers = teachers;
    // } else {
    //   this.teachers = await firstValueFrom(request);
    // }
    this.teachers = await firstValueFrom(request);

    this.cdr.detectChanges();
    if (!this.data() && this.teachers.length === 1) {
      this.change(this.teachers[0]);
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
    this.cdr.detectChanges();
  }

  async ngOnInit() {

    // propagate value changes to parent form control
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: unknown) => {
      if (!value) {
        this.onChangeFn(null);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as User);
      }
    });

    if (this.classHash) {
      await this.getTeachers();
    }

    // this.filteredOptions = this.control.valueChanges.pipe(
    //   takeUntil(this.destroy$),
    //   startWith(''),
    //   map(value => this._filter(value || '')),
    // );

    // this.control.setValue(' ');
    // this.control.updateValueAndValidity();


    let noItemsMessage = this.noItemsMessage;
    if (!this.all && !this.schoolId) {
      noItemsMessage = 'Select a school';
    }
    else if (this.schoolId) {
      noItemsMessage = 'No teachers found for the selected school';
    }
    this.noItemsMessage = this.translatePipe.transform(noItemsMessage);
    // this.noItemsMessage = this.translatePipe.transform('No teachers found with the given parameters');

  }

  // ControlValueAccessor implementation
  writeValue(value: User | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: User | null) => void): void {
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
