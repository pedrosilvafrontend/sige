export class DayShifts {
  id!: string;
  name: string;
  constructor(item: Partial<DayShifts> = {}) {
    {
      // this.id = item.id || this.getID(item.name);
      this.name = item.name || '';
    }
  }
  // public getID(name?: string): string {
  //   const S4 = () => {
  //     return ((1 + Math.random()) * 0x10000) | 0;
  //   };
  //   const id = (name || '').trim().replaceAll(' ', '_').toUpperCase();
  //   return id || String(S4() + S4());
  // }
}
