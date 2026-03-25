import { Component, input, output } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { Activity, LessonEvent, Proof, User } from '@models';
import { MatTooltip } from '@angular/material/tooltip';
import { ColorPipe } from '@util/color-pipe';

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
    ColorPipe
  ],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  user = input.required<User>();
  event = input.required<LessonEvent>();
  color = input<string>('');
  activities = input.required<Map<string, Activity>>();
  onClick = output();
  statusClass: any = Proof.statusClass;
  dateFormat = 'dd/MM/yyyy';

}
