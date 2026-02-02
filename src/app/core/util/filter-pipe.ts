import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], key: string, value: any): any[] {
    if (!items || !key || value === undefined) {
      return items;
    }

    return items.filter(item => item[key] === value);
  }
}
