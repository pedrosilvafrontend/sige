import { Frequency, LessonBatch } from '@models';

export class LessonsMap {
  private lessons: Map<string, LessonBatch> = new Map();

  get list(): LessonBatch[] {
    return Array.from(this.lessons.values());
  }

  uk(lesson: LessonBatch): string {
    const ids = [lesson.school?.id, lesson.schoolClass?.code, lesson.curricularComponent?.id, lesson.teacher?.id];
    if (ids.some(id => !id)) return '';
    return ids.join('|');
  }

  add(lesson: LessonBatch) {
    this.setLesson(lesson);
  }

  getLesson(lesson: LessonBatch): LessonBatch {
    const uniqueKey = this.uk(lesson);
    if (!uniqueKey) return lesson;
    return this.lessons.get(uniqueKey) || lesson;
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
      frequencies.set(uk(frequency), frequency);
    }
    (lessonA.frequencies || []).concat(lessonB.frequencies || []).forEach(addFrequency)
    return Array.from(frequencies.values());
  }

  setLesson(lesson: LessonBatch) {
    const uniqueKey = this.uk(lesson);
    if (!uniqueKey) return lesson;
    if (this.lessons.has(uniqueKey)) {
      const lessonToUpdate = this.lessons.get(uniqueKey);
      const frequencies = (lessonToUpdate ? this.frequenciesConcat(lessonToUpdate, lesson) : lesson.frequencies) || [] as Frequency[];
      const updatedLesson = Object.assign((lessonToUpdate || {}), lesson);
      updatedLesson.frequencies = frequencies;
      lesson = updatedLesson;
    }
    this.lessons.set(uniqueKey, lesson);
    return this.getLesson(lesson);
  }

  clear() {
    this.lessons.clear();
  }

}
