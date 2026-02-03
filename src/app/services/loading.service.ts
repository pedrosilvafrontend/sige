import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _isShow = signal(false);
  readonly isShow = this._isShow.asReadonly();
  private _items = signal<Set<string>>(new Set());
  message = signal('');
  timeout = 5000;
  timer: any = null;

  show(id: string, message?: string) {
    if (!id || this._items().has(id)) return;
    this._items().add(id);
    this.message.set(message ?? '');
    this.onShow();
  }
  hide(id: string) {
    if (id === '*') return this.reset()
    if (!this._items().has(id)) return;
    this._items().delete(id);
    this.check();
  }

  reset() {
    this._items().clear();
    this.check();
  }

  private check() {
    if(this._items().size > 0) {
      this._isShow.set(true);
    } else {
      this._isShow.set(false);
      this.message.set('');
    }
  }

  private onShow() {
    this._isShow.set(true);
    if (this._items().size === 1) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.hide('*'), this.timeout);
    }
  }
}
