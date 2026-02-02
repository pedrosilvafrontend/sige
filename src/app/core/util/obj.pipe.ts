import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obj',
  standalone: true
})
export class ObjPipe implements PipeTransform {

  transform(obj: any, key: string): unknown {
    return obj[key];
  }

}
