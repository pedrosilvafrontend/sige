import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { startWith, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-base-select',
  template: '<ng-content></ng-content>',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSelect),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class BaseSelect<T> implements ControlValueAccessor, OnInit, OnDestroy {
  public control = new FormControl();
  private _data: T[] = [];
  public filteredOptions: T[] = [];
  private destroy$: Subject<void> = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  // ControlValueAccessor hooks
  private onChangeFn: (value: T | null) => void = () => {};
  private onTouchedFn: () => void = () => {};
  public noItemsMessage = 'No items found';

  abstract getData(params: any): any;
  abstract filter(value: string | T): T[]
  abstract displayFn(item: T): string

  get data() {
    return this._data;
  }
  set data(value: T[]) {
    this._data = value;
    this.cdr.detectChanges();

    this.control.valueChanges.pipe(
      takeUntil(this.destroy$),
      startWith(''),
      map((value: any) => this.filter(value || '')),
    ).subscribe((data: T[]) => {
      this.filteredOptions = data;
      if (this.data.length === 0) {
        this.noItemsMessage = 'No items found';
      } else {
        this.noItemsMessage = 'No items found for the selected params';
      }
    })
  }

  // ControlValueAccessor implementation
  writeValue(value: T | null): void {
    this.control.setValue(value ?? null, { emitEvent: false });
  }

  registerOnChange(fn: (value: T | null) => void): void {
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

  ngOnInit() {
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: unknown) => {
      if (!value) {
        this.onChangeFn(null);
        return;
      }
      if (typeof value === 'object') {
        this.onChangeFn(value as T);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
