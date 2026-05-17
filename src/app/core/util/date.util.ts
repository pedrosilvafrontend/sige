import * as fns from 'date-fns';
import { isValid } from 'date-fns';

export class DateUtil {
  static isoFormat = 'yyyy-MM-dd\'T\'HH:mm:ssXXX';


  /**
   * Calculates the next business day for a given date.
   *
   * @param {Date} date The date to determine the next business day from.
   * @return {Date} The next business day. If the provided date is a weekend, it adjusts to the following Monday. Otherwise, it returns the same date.
   */
  static nextBusinessDay(date: Date = new Date()): Date {
    if (!date) {
      date = new Date();
    }
    if (!(date instanceof Date && isValid(date))) {
      return date;
    }
    if (fns.isWeekend(date)) {
      const weekDay = fns.getDay(date);
      // Se for sábado (6), adiciona 2 dias. Se for domingo (0), adiciona 1 dia.
      return weekDay === 6 ? fns.addDays(date, 2) : fns.addDays(date, 1);
    }
    // Retorna a própria date se já for dia útil
    return date;
  }
}
