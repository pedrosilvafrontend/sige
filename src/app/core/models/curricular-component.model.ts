export class CurricularComponent {
  id: number;
  name: string;
  code: string;
  classYearId: string;
  constructor(curricularComponent: Partial<CurricularComponent> = {}) {
    {
      this.id = curricularComponent.id || 0;
      this.name = curricularComponent.name || '';
      this.code = curricularComponent.code || '';
      this.classYearId = curricularComponent.classYearId || '';
    }
  }
}
