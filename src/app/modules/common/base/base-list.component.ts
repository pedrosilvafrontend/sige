import { Component, inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';

@Component({ standalone: true, template: ''})
export class BaseListComponent<T> implements OnDestroy {
  protected translate = inject(TranslateService);
  protected _columnsLabels: string[] = [];
  protected columnsLabelsOriginal: string[] = [];
  get columnsLabels() {
    return this._columnsLabels
  }
  set columnsLabels(labels: string[]) {
    this.columnsLabelsOriginal = (labels || []);
    this._columnsLabels = (labels || []).map((key: string) => this.translate.instant(key));
    this.setColumns();
  }

  public columnDefinitions: any[] = [];

  setColumns() {
    this.columnDefinitions = this.columnsLabelsOriginal.map((label: string, i: number) => {
      return { def: label, label: this.columnsLabels[i], type: 'text', visible: true }
    })
  }

  dataSource = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  loading = false;
  destroy$ = new Subject<void>();


  ngOnDestroy() {
    console.log('>>> BASE DESTROY');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
