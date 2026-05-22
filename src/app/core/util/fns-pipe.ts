import { Pipe, PipeTransform } from '@angular/core';
import * as fns from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

@Pipe({
  name: 'fns',
})
export class FnsPipe implements PipeTransform {

  transform(fnsFunctionName: string, ...args: unknown[]): unknown {
    if (!fnsFunctionName) return null;
    const fnsFunction = (fns as any)[fnsFunctionName];
    if (!fnsFunction) return null;

    args = (args || []).map((arg: any) => {
      if (typeof arg === 'object') {
        if (['pt', 'ptBR'].includes(arg?.locale)) {
          arg.locale = ptBR;
        }
      }
      return arg;
    });


    if (fnsFunctionName == 'format'){
      return fnsFunction(...args);
    }
    // if (outFormat){
    //   const val = fnsFunction(...args);
    //   if (fns.isValid(val)) {
    //     return fns.format(val, outFormat);
    //   }
    // }
    return fnsFunction(...args);
  }

}

// O terceiro argumento recebe o ptBR se nenhum outro locale for passado
export function format(date: Date | number, formatString: string, options?: any) {
  return fns.format(date, formatString, { locale: ptBR, ...options });
}

export function formatDistanceToNow(date: Date | number, options?: any) {
  return fns.formatDistanceToNow(date, { locale: ptBR, ...options });
}
