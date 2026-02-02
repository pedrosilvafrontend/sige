import { Address } from '@models';

export class School {
  id: number;
  img: string;
  name: string;
  email: string;
  acronym: string;
  foundationDate: string;
  phone: string;
  address?: Address;
  constructor(school: Partial<School> = {}) {
    {
      this.id = school.id || 0;
      this.img = school.img || '';
      this.name = school.name || '';
      this.email = school.email || '';
      this.acronym = school.acronym || '';
      this.foundationDate = school.foundationDate || '';
      this.phone = school.phone || '';
      this.address = school.address;
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
