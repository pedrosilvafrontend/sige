import { LessonBatch, LessonEvent, UniqueLessonEvent, Weekday } from '@models';
import { Subject, switchMap, debounceTime, ObservableInput } from 'rxjs';

export class Util {
  static delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  static lessonUK(lesson: LessonBatch): string {
    const ids = [lesson.school?.id, lesson.schoolClass?.code, lesson.curricularComponent?.id, lesson.teacher?.id];
    if (ids.some(id => !id)) return '';
    return ids.join('|');
  }

  static lastCall(fn: Function, timeout: number = 1000) {
    let time = 0;
    return () => {
      clearTimeout(time);
      time = setTimeout(() => {
        return fn();
      }, timeout);
    }
  }

  static debounce(fn: (...args: any[]) => Promise<any>, delay: number = 1000, callback?: (...args: any[]) => void) {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args).then(callback);
      }, delay);
    };
  }

  static debounceFn<T=any>(fn: (value: T, index: number) => ObservableInput<T>) {
    const triggerRequest = new Subject<T>();
    triggerRequest.pipe(
      debounceTime(500),
      switchMap(fn)
    ).subscribe({
      next: resultado => console.log('Sucesso:', resultado),
      error: erro => console.error('Erro:', erro)
    });
    return triggerRequest;
  }

  static eventCompare(a: LessonEvent, b: LessonEvent): boolean {
    return a.date === b.date
      && a.frequency.timeSchedule?.id === b.frequency.timeSchedule?.id
      && a.lesson?.id === b.lesson?.id;
  }

  static minimalEvent(event: LessonEvent) : LessonEvent {
    const { title, activities, date, frequency, lesson, school, weekday, styleClass, start, end, extra,
      color, observations, countActivities, evalTools, curricularComponent } = event;
    const { timeSchedule } = frequency;
    const { schoolClass } = lesson;
    const { proof, work } = evalTools;
    return {
      title,
      date,
      start,
      end,
      weekday,
      color,
      activities: activities || [],
      frequency: {
        timeSchedule: {
          id: frequency.id || 0,
          startTime: timeSchedule?.startTime || '',
          endTime: timeSchedule?.endTime || '',
          dayShiftId: timeSchedule?.dayShiftId || 0,
        },
        weekday: weekday || frequency.weekday,
      },
      lesson: {
        id: lesson?.id || 0,
        teacher: {
          id: lesson.teacher?.id || 0,
          fullName: lesson.teacher?.fullName || '',
        },
        schoolClass: {
          id: schoolClass?.id || 0,
          code: schoolClass?.code || '',
        }
      },
      school: {
        id: school?.id || 0,
        name: school?.name || '',
        acronym: school?.acronym || '',
      },
      evalTools: {
        proof: {
          id: proof?.id || 0,
        },
        work: {
          id: work?.id || 0,
        }
      },
      curricularComponent: {
        id: curricularComponent?.id || 0,
        name: curricularComponent?.name || '',
      }
    } as LessonEvent;
  }

  static toUniqueLessonEvent(event: LessonEvent): UniqueLessonEvent {
    return {
      date: event.date || '',
      schoolId: event.school?.id || 0,
      lessonId: event.lesson?.id || 0,
      classId: event.schoolClass?.id || 0,
      classCode: event.schoolClass?.code || '',
      frequencyId: event.frequency?.id || 0,
      timeScheduleId: event.frequency?.timeSchedule?.id || 0,
      weekday: (event.weekday || event.frequency?.weekday || 'UNIQUE') as Weekday,
      proofId: event.evalTools?.proof?.id || 0,
      proofType: event.evalTools?.proof?.type || '',
      workId: event.evalTools?.work?.id || 0,
      selected: (event as any)?.selected || false
    }
  }

}
