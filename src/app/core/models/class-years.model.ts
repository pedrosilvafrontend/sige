export class ClassYears {
  id!: string;
  name: string;
  constructor(item: Partial<ClassYears> = {}) {
    {
      this.name = item.name || '';
    }
  }
}
