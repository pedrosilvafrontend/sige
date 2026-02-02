import { Address, School } from '@models';

export type UserType = 'admin' | 'principal' | 'coordinator' | 'teacher' | 'association' | '';

export class UserTable {
  id: number;
  img: string; // Imagem em formato base64
  fullName: string;
  email: string;
  gender: string;
  birthDate: string; // Data de nascimento (ISO: 'yyyy-MM-dd')
  mobile: string; // Número de telefone (máximo 16 caracteres)
  address: Address | undefined;
  country: string;
  role: UserType;
  schools: School[] = [];

  constructor(table: Partial<UserTable> = {}) {
    {
      this.id = table.id || 0;
      this.img = table.img || '';
      this.fullName = table.fullName || '';
      this.email = table.email || '';
      this.gender = table.gender || '';
      this.birthDate = table.birthDate || '';
      this.mobile = table.mobile || '';
      this.address = table.address;
      this.country = table.country || '';
      this.role = table.role || 'teacher';
      this.schools = table.schools || [];
    }
  }

  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
