import { Pipe, PipeTransform } from '@angular/core';
import * as fns from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

@Pipe({
  name: 'fns',
})
export class FnsPipe implements PipeTransform {

  transform(date: fns.DateArg<Date> & {}, funcName: string, ...args: unknown[]): any {
    if (!funcName) return null;
    const fn = (fns as any)[funcName];
    if (!fn) return null;

    args = [date, ...args].map((arg: any) => {
      if (typeof arg === 'object') {
        if (['pt', 'ptBR'].includes(arg?.locale)) {
          arg.locale = ptBR;
        }
      }
      return arg;
    });

    if (funcName == 'format'){
      return fn(...args);
    }
    return fn(...args);
  }

}

// O terceiro argumento recebe o ptBR se nenhum outro locale for passado
export function format(date: Date | number, formatString: string, options?: any) {
  return fns.format(date, formatString, { locale: ptBR, ...options });
}

export function formatDistanceToNow(date: Date | number, options?: any) {
  return fns.formatDistanceToNow(date, { locale: ptBR, ...options });
}
