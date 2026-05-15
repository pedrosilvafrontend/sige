import { debounceTime, Observable, ObservableInput, Subject, switchMap } from 'rxjs';

export class Debounce<T=any> {
  trigger$ = new Subject<T>();
  sub$: Observable<T>;

  constructor(fn: (value: T, index: number) => ObservableInput<T>) {
    this.sub$ = this.trigger$.pipe(
      debounceTime(1000),
      switchMap(fn)
    )
    this.sub$.subscribe({
      next: resultado => console.log('Sucesso:', resultado),
      error: erro => console.error('Erro:', erro)
    });
  }

  request(data: T) {
    return this.trigger$.next(data);
  }

}


// export function Debounce<T=any>(fn: (value: T, index: number) => ObservableInput<T>) {
//   const trigger$ = new Subject<T>();
//
//   return () => {
//     return trigger$.pipe(
//       debounceTime(500),
//       switchMap(fn)
//     )
//   }
// }
