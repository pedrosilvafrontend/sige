import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mergeObjects',
  standalone: true // Use standalone for Angular 21
})
export class MergeObjectsPipe implements PipeTransform {
  transform(obj1: any, obj2: any): any {
    if (!obj1) return obj2;
    if (!obj2) return obj1;
    return { ...obj1, ...obj2 };
  }
}
