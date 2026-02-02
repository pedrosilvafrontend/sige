import { FormControl } from '@angular/forms';
import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';

export class Autocomplete<T> {

  control = new FormControl('');
  // dataOptions: T[] = [];
  options: T[] = [];
  keys!: string | string[];
  filtered: Observable<T[]>;

  constructor(options?: T[], keys?: string | string[]) {
    if (options) {
      this.options = options;
    }
    if (keys) {
      this.keys = keys;
    }
    this.filtered = this.control.valueChanges.pipe(
      startWith(''),
      map((value: any) => this._filter(value || '')),
    );
  }

  private _filter(value: string): T[] {
    if (typeof value !== 'string') {
      return this.options;
    }
    const filterValue = value.toLowerCase();
    if (!filterValue.trim()) {
      return this.options;
    }
    try {
      if (!this.keys) {
        return this.options.filter(option => (option as string).toLowerCase().includes(filterValue));
      }
      if (Array.isArray(this.keys)) {
        const optionStr = (option: T) => {
          return (this.keys as string[]).map(key => (option as any)[key] || '').join(' ');
        }
        return this.options.filter(option => {
          return optionStr(option).toLowerCase().includes(filterValue);
        });
      }
    }
    catch (e) {
      console.error(e);
    }
    return this.options;
  }

}
