import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codePrefix',
})
export class CodePrefixPipe implements PipeTransform {

  transform(value?: string | null): string {
    return (value || '').match(/^[A-Za-z]+\d+/)?.[0] || '';
  }

}
