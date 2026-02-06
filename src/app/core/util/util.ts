export class Util {
  static objectCompare(option: any, value: any) : boolean {
    return option.id && (option.id === value?.id);
  }

  static objectCompareByKey(key: string) {
    return (option: any, value: any) => {
      return option[key] && (option[key] === value?.[key]);
    }
  }

  static removeAccents(str: string){
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static removeExtraSpaces(str: string){
    return str.replace(/\s+/g, ' ').trim();
  }

  static toCompare(str: string){
    str = this.removeAccents(str);
    str = this.removeExtraSpaces(str);
    return str.toLowerCase();
  }

  // static toScore(str: string){
  //   return parseFloat((str || 0).toString().replace(',', '.')).toFixed(1);
  // }

  static isPhone(phone: string) {
    if(!phone) return false;
    if (!phone.startsWith('+')) {
      phone = '+55 ' + phone;
    }
    const regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return regex.test(phone);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static jsonToUrlParams(paramsOb: any) {
    const params = new URLSearchParams();
    for (const key in paramsOb) {
      if (Object.prototype.hasOwnProperty.call(paramsOb, key)) {
        params.append(key, paramsOb[key]);
      }
    }
    return params.toString();
  }

  static utcToLocal(date: Date) {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  static classCodeSplit(code: string) {
    const [classCode,degreeId,year,dayShiftId,suffixId] = new RegExp('^([A-Z]{2})([0-9])([A-Z])([A-Z])$').exec(code) || [];
    return {classCode,degreeId,year,dayShiftId,suffixId};
  }

  // static utcToLocalKeepTime(date: MomentInput) {
  //   return moment.utc(date).local(true).format('YYYY-MM-DDTHH:mm:ssZ');
  // }

}
