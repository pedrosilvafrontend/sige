import { Util } from '@core/util/util';

export class SchoolsUtils {

  static schoolImageError(event: any, item: any) {
    if (!event?.target) return;
    const name = Util.toCompare(item.name);
    if(name.includes('colegio adventista') || name.includes('escola adventista')) {
      event.target.src = '/assets/images/logo.png';
    }
  }

}
