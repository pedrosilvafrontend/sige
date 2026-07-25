import { ChangeDetectorRef, Component, effect, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { ModalComponent } from '@ui/modal/modal.component';
import { Button } from '@ui/button/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { EventCard } from '@ui/event-card/event-card';
import { Skeleton } from '@ui/skeleton/skeleton';
import { ActivityConfig, LessonEvent } from '@models';
import { AuthService } from '@services';
import { DateUtil } from '@util';
import { endOfYear, format, isValid, setMonth, setYear, startOfDay } from 'date-fns';
import { LessonEventService } from '@services/lesson-event.service';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { form, FormRoot, FormField } from '@angular/forms/signals';
import { DatePickerFormatDirective } from '@util/datepicker-format.directive';
import Swal from 'sweetalert2';
import {
  EventResource,
  eventResourceFactory,
  EventsResourceParams,
  newEventResource
} from '@core/resources/lesson-event.resource';
import { FnsPipe } from '@util/fns-pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'ui-event-select-modal',
  imports: [
    ModalComponent,
    Button,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    TranslatePipe,
    EventCard,
    Skeleton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    FormRoot,
    FormField,
    DatePickerFormatDirective,
    FnsPipe
  ],
  templateUrl: './event-select-modal.html',
  styleUrl: './event-select-modal.scss',
})
export class EventSelectModal implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  protected lessonEventService = inject(LessonEventService);
  auth = this.authService.user$.value;
  isManager = ['admin', 'association', 'principal', 'coordinator'].includes(this.auth.role || '');
  activities: Map<string, ActivityConfig> = new Map();
  events: LessonEvent[] = [];
  minDate = startOfDay(new Date());
  maxDate = endOfYear(new Date());
  isLoading = signal(true);
  filters = signal({ date: new Date() })
  filtersForm = form(this.filters);
  lastDate = '';
  modal = viewChild<ModalComponent>('modal');
  private eventResource!: EventResource;
  params = input<any>({});
  onSelect = output<LessonEvent>();
  title = input('Select a lesson');
  fnsLocale = { locale: 'ptBR' };
  classHash = '';
  eventResourceParams: EventsResourceParams = {}
  getEventResource = eventResourceFactory();

  constructor() {
    // const getEventResource = eventResourceFactory();
    // effect(() => {
    //   this.classHash = this.params()?.['classHash'] || '';
    //
    // });
  }

  async open(filterParams?: any) {
    this.lastDate = '';
    this.filters.update(state => ({
      ...state,
      date: new Date()
    }));
    await this.getEvents(filterParams);
    const ref = this.modal()?.open();
    // this.getEvents(filterParams).then(
    //   () => this.modal()?.open()
    // ).catch(
    //   (err) => Swal.fire('', 'Falha ao carregar eventos', 'error')
    // );
    this.cdr.detectChanges();
    return ref;
  }

  close(data?: any) {
    this.lastDate = '';
    this.modal()?.close(data);
  }

  select(event: LessonEvent) {
    this.onSelect.emit(event);
    this.close(event);
  }

  async getEvents(filterParams?: any) {
    this.isLoading.set(true);
    // this.loadedEvents = false;
    const date = this.filters().date;
    const nextBusinessDay = DateUtil.nextBusinessDay(new Date());
    const dateFormat = 'yyyy-MM-dd';
    const formattedDate = date instanceof Date && isValid(date)
      ? format(date, dateFormat)
      : format(nextBusinessDay, dateFormat);

    if (this.events.length && this.lastDate && this.lastDate === formattedDate) {
      return;
    }
    this.lastDate = formattedDate;
    this.events.length = 0;

    const params: any = {
      limit: 150,
      prevDate: false,
      classHash: this.classHash,
      ...filterParams,
      ...(this.params() || {})
    }
    if (this.auth?.role === 'teacher') {
      params.month = formattedDate;
    } else {
      params.date = formattedDate;
    }
    if (!this.eventResource) {
      this.eventResource = this.getEventResource(params);
    } else {
      this.eventResource.update(params);
    }

    this.events = await this._getEvents(params);

    // this.loadedEvents = true;
    this.cdr.detectChanges();
    this.isLoading.set(false);
  }

  async _getEvents(params: any) {
    this.classHash = this.params()?.['classHash'] || '';
    const request$ = this.classHash
      ? this.lessonEventService.getPublicAll(params)
      : this.lessonEventService.getAll(params);
    return await firstValueFrom(request$);
  }

  dateSelected(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
    const filterDate = this.filters().date;
    let date = filterDate ? new Date(filterDate) : new Date();

    date = setMonth(date, normalizedMonthAndYear.getMonth());
    date = setYear(date, normalizedMonthAndYear.getFullYear());

    this.filters.update(state => ({
      ...state,
      date
    }));
    datepicker.close();
    this.getEvents().then();
  }

  datepickerSelect(ev: any, datepicker: MatDatepicker<Date>) {
    if (!this.isManager) {
      return;
    }
    this.dateSelected(ev.value, datepicker);
  }

  async ngOnInit() {
  }

}
