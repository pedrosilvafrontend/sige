import { Frequency, LessonBatch } from '@models';
import Swal from 'sweetalert2'
import { Util } from '@util/util';

export class LessonsMap {
  private lessons: Map<string, LessonBatch> = new Map();
  // private _id = -1;
  // get id() { return this._id--; }

  get list(): LessonBatch[] {
    return Array.from(this.lessons.values());
  }

  uk(lesson: LessonBatch): string {
    return Util.lessonUK(lesson);
  }

  add(lesson: LessonBatch) {
    this.setLesson(lesson);
  }

  getLesson(lesson: LessonBatch): LessonBatch | null {
    const uniqueKey = this.uk(lesson);
    if (!uniqueKey) return null;
    const les = this.lessons.get(uniqueKey);
    if (les) {
      if (this.uk(les) !== uniqueKey) return null;
      return Object.assign({}, les);
    }
    return null;
  }

  frequenciesConcat(lessonA: LessonBatch, lessonB: LessonBatch): Frequency[] {
    const frequencies = new Map<string, Frequency>();
    const uk = (frequency: Frequency) => {
      if (!frequency.weekday || !frequency.timeSchedule?.id) return '';
      return `${frequency.weekday}|${frequency.timeSchedule?.id}`
    };
    const addFrequency = (frequency: Frequency) => {
      const key = uk(frequency);
      if (!key) return;
      frequency.id = 0;
      frequencies.set(key, frequency);
    }
    (lessonA.frequencies || []).concat(lessonB.frequencies || []).forEach(addFrequency);
    return Array.from(frequencies.values());
  }

  setLesson(lesson: LessonBatch) {
    const uniqueKey = this.uk(lesson);
    if (!uniqueKey) return null;
    const existingLesson = this.getLesson(lesson);
    if (existingLesson) {
      lesson.frequencies = this.frequenciesConcat(existingLesson, lesson);
    } else {
      (lesson.frequencies || []).forEach(frequency => frequency.id = 0);
    }
    this.lessons.set(uniqueKey, lesson);
    return this.getLesson(lesson);
  }

  clear() {
    this.lessons.clear();
  }

}
