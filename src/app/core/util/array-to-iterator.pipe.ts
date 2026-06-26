import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToIteratorPipe',
})
export class ArrayToIteratorPipe implements PipeTransform {

  transform<T>(value: T[]): IterableIterator<T> {
    if (!Array.isArray(value)) {
      return [value].values();
    }
    return value.values();
  }

}
