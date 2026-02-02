export class ClassSuffixes {
  id!: string;
  name: string;
  constructor(item: Partial<ClassSuffixes> = {}) {
    {
      this.name = item.name || '';
    }
  }
}
