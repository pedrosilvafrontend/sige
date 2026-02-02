import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormGroup
} from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Autocomplete, ObjPipe } from '@util';

@Component({
  selector: 'app-multi-badges',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatIcon,
    MatInput,
    MatOption,
    TranslateModule,
    ReactiveFormsModule,
    ObjPipe,
    NgClass,
    NgStyle
  ],
  templateUrl: './multi-badges.component.html',
  styleUrl: './multi-badges.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiBadgesComponent<T> implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private _data!: T[];
  private _items!: T[];
  public form: UntypedFormArray = new FormArray([] as any);
  public autocomplete!: Autocomplete<T>;
  private fb = new FormBuilder();
  public selecteds = new Set<any>();
  private life$ = new Subject<void>();
  public disabled = input(false);

  @Input() keyView = '';
  @Input() keysAutocomplete: string[] = [];
  @Input() trackBy = 'id';
  @Input() compareFn: (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1[this.trackBy] === o2[this.trackBy];

  @Input()
  set data(data: T[]) {
    this._data = data;
    if (data) {
      this.patchForm(data);
    }
  }
  get data(): T[] {
    return this._data || [] as T[];
  }

  @Input()
  set items(items: T[]) {
    this._items = Object.assign([], items);
    if (items) {
      this.autocomplete = new Autocomplete(Object.assign([], items), this.keysAutocomplete || [this.keyView]);
      this.setSelecteds();
    }
  }
  get items(): T[] {
    return this._items || [] as T[];
  }

  @Output()
  public form$ = new BehaviorSubject(this.form);

  patchForm(data: T[]) {
    (data || []).forEach(item => {
      const id = (item as any)[this.trackBy];
      if (!this.selecteds.has(id)) {
        this.form.push(this.createFormItem(item));
        this.selecteds.add(id);
      }
    });
  }

  selectItem(item: any) {
    this.autocomplete.control.reset();
    if (this.selecteds.has(item[this.trackBy])) {
      return;
    }
    this.form.push(this.createFormItem(item));
  }

  removeItem(item: any) {
    const index = (this.form.value).findIndex((a: any) => this.compareFn(a, item));
    this.form.removeAt(index);
  }

  createFormItem(data: T): UntypedFormGroup {
    return this.fb.group(data || {});
  }

  onBlur() {
    setTimeout(() => {
      this.autocomplete.control.reset()
    }, 500)
  }

  ngOnInit() {
    this.form.valueChanges.pipe(takeUntil(this.life$)).subscribe({
      next: () => this.setSelecteds()
    })

    this.cdr.detectChanges();
  }

  setSelecteds() {
    this.selecteds.clear();
    this.form.value.forEach((item: any) => this.selecteds.add(item[this.trackBy]));
    const autocompleteOptions = Object.assign([], this.items).filter((item: any) => !this.selecteds.has(item[this.trackBy]));
    this.autocomplete.options.length = 0;
    Object.assign(this.autocomplete.options, autocompleteOptions);
    this.autocomplete.control.updateValueAndValidity()
  }

  resetSelecteds() {
    this.form.value.forEach((item: any) => this.removeItem(item));
    this.selecteds.clear();
    this.autocomplete.options.length = 0;
    this.autocomplete.control.updateValueAndValidity()
  }

  ngOnDestroy() {
    this.form$.complete();
    this.life$.next();
    this.life$.complete();
  }

}
