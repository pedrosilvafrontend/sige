import { Injectable, signal } from '@angular/core';
import { LessonBatch } from '@models';

@Injectable({
  providedIn: 'root'
})
export class LessonStateService {
  private selectedLessonSignal = signal<LessonBatch | null>(null);

  // Getter para o signal
  getSelectedLesson() {
    return this.selectedLessonSignal;
  }

  // Método para atualizar o signal
  setSelectedLesson(lesson: LessonBatch) {
    this.selectedLessonSignal.set(lesson);
  }

  // Método para limpar o signal
  clearSelectedLesson() {
    this.selectedLessonSignal.set(null);
  }
}
