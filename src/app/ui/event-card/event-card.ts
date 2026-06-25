import { Component, computed, effect, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityConfig, LessonEvent, Test, User } from '@models';
import { MatTooltip } from '@angular/material/tooltip';
import { activityStatusClassPipe, ColorPipe, ColorStylePipe } from '@util/color-pipe';

@Component({
  selector: 'ui-event-card',
  imports: [
    DatePipe,
    MatCard,
    MatCardContent,
    TranslatePipe,
    NgStyle,
    NgClass,
    MatTooltip,
    ColorPipe,
    ColorStylePipe,
    activityStatusClassPipe
  ],
  templateUrl: './event-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './event-card.scss',
})
export class EventCard {
  auth = input.required<User>();
  event = input.required<LessonEvent>();
  colorI = input<string>('', { alias: 'color' });
  activities = input<Map<string, ActivityConfig>>(new Map());
  onClick = output();
  statusClass: any = Test.statusClass;
  dateFormat = 'dd/MM/yyyy';
  color = '';

  constructor() {
    effect(() => {
      this.color = this.colorI();
      if (this.event()?.color && !this.color) {
        this.color = this.event().color || '';
      }
    });
  }
}
