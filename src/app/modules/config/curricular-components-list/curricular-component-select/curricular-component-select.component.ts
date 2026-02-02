import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect, forwardRef,
  inject,
  input, OnDestroy,
  OnInit,
} from '@angular/core';
import { CurricularComponentsListService } from '@modules/config/curricular-components-list/curricular-components-list.service';
import { Util } from '@core/util/util';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl, FormsModule,
  NG_VALUE_ACCESSOR, ReactiveFormsModule,
} from '@angular/forms';
import { firstValueFrom, Observable, startWith, Subject, take, takeUntil } from 'rxjs';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { CurricularComponent } from '@models/curricular-component.model';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-curricular-component-select',
  standalone: true,
  imports: [
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    TranslateModule,
    FormsModule,
    MatAutocompleteTrigger,
    MatInput,
    ReactiveFormsModule,
    AsyncPipe,
    MatAutocomplete
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurricularComponentSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './curricular-component-select.component.html',
  styleUrl: './curricular-component-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurricularComponentSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private curricularComponentListService = inject(CurricularComponentsListService);
  private fb = inject(FormBuilder);
  public destroy$: Subject<void> = new Subject<void>();
  public objectCompare = Util.objectCompare;
  public noItemsMessage = 'No curricular components found';
  public curricularComponents: CurricularComponent[] = [];
  public control = new FormControl();
  public filteredOptions!: Observable<CurricularComponent[]>;
  private value: CurricularComponent | null = null;
  public inputTarget: HTMLInputElement | null = null;

  classYearId = input('');
  cdr = inject(ChangeDetectorRef);

  private onChangeFn: (value: CurricularComponent | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor() {
    effect(() => {

      if (this.classYearId()) {
        this.curricularComponents = [];
        this.getCurricularComponent(this.classYearId()).then();
      }
    });
  }

  change(data: CurricularComponent) {
    if (!data) {
      this.control.reset();
    }
    this.control.setValue(data, { emitEvent: false });
    this.onChangeFn(data || null);
  }

  displayFn(data: CurricularComponent) {
    return data?.code ? data.code + ' - ' + data.name : (data?.name || '');
  }

  private _filter(value: string | CurricularComponent): CurricularComponent[] {
    if (typeof value !== 'string') {
      return this.curricularComponents.slice() as CurricularComponent[];
    }
    const filterValue = (value || '').toLowerCase().trim();
    if (!filterValue) {
      return this.curricularComponents.slice() as CurricularComponent[];
    }
    return this.curricularComponents.filter(item => {
      const codeName = ((item.code || '') + ' - ' + (item.name || ''));
      return Util.toCompare(codeName).includes(Util.toCompare(filterValue));
    });
  }

  async getCurricularComponent(classYearId: string) {
    this.curricularComponents = await firstValueFrom(this.curricularComponentListService.getAll(classYearId)) || [];

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

  ngOnInit() {
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: unknown) => {
      if (!value) {
        this.onChangeFn(null);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as CurricularComponent);
      }
    });

    if (this.classYearId()) {
      this.noItemsMessage = 'No curricular components found for the selected school class';
    }
    else {
      this.noItemsMessage = 'Select a school class';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: CurricularComponent | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: CurricularComponent | null) => void): void {
    this.onChangeFn = (value: (CurricularComponent | null)) => {
      if (value) {
        this.value = value;
      }
      fn(value);
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    const action = isDisabled ? 'disable' : 'enable';
    this.control[action]();
  }

  handleFocus(event: Event): void {
    this.inputTarget = event.target as HTMLInputElement;
    this.inputTarget?.select();
  }

  handleBlur(): void {
    this.onTouchedFn();
    if (typeof this.control.value !== 'object') {
      this.control.setValue(this.value || null, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
