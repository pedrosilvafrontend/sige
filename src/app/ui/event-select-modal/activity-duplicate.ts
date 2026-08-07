import { LessonEvent, ModalSignal, Test, Work } from '@models';
import Swal from 'sweetalert2';
import { take } from 'rxjs';
import { effect, Signal } from '@angular/core';

interface Construtor<T> {
  new (): T;
}

export class ActivityDuplicate<T extends Work | Test> {
  target: T;
  data!: T;
  overrideData: Partial<T> | null = null;
  private modal: ModalSignal;
  private eventSelectModal: ModalSignal;
  private compareModal: ModalSignal;
  type: "work" | "test";
  private _nextMode = false;
  private readonly entity: Construtor<T>;
  private event!: LessonEvent;

  get nextMode(): boolean {
    return this._nextMode;
  }
  set nextMode(value: boolean) {
    this._nextMode = value;
    if (!value) {
      this.target = new this.entity();
    }
  }

  constructor(entity: Construtor<T>, modal: ModalSignal, eventSelectModal: ModalSignal, compareModal: ModalSignal) {
    this.entity = entity;
    this.target = new entity();
    this.type = this.target instanceof Work ? 'work' : 'test';
    this.modal = modal;
    this.eventSelectModal = eventSelectModal;
    this.compareModal = compareModal;
  }

  async selectEvent(event: LessonEvent) {
    let target: Test | Work;
    const { test, work } = event.evalTools;
    if (this.type === 'test' && test) {
      target = test;
      if (target?.type === 'MULTICLASS_TEST') {
        await Swal.fire({
          title: 'Prova bimestral',
          text: 'Não é possível duplicar para prova bimestral',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    } else if (this.type === 'work' && work) {
      target = work;
    } else {
      return;
    }


    if (target?.id) {
      // this.target = target;
      const ref = this.compareModal()?.open();
      ref?.afterClosed().pipe(take(1)).subscribe((resp: any) => {

        if (!resp) {
          target = new Work();
          this.overrideData = null;
        }
        if (resp === true || resp === false) {
          if (resp) {
            if (target instanceof this.entity) {
              this.target = target;
            }
            this.overrideData = Object.assign({}, this.data);
          } else {
            this.overrideData = null;
          }

          this.openModal().then();
        }
        this.reset(event).then();
      });
      return;
    }
    this.reset(event).then();
    this.openModal().then();


  }

  async openModal(context?: any) {
    // let codePrefix = this.dialogData.item.schoolClass?.codePrefix || '';
    // const schoolClass = this.dialogData.item.schoolClass;
    // const classCode = schoolClass?.code || '';
    // const testContext: any = {
    //   classHash: this.classHash,
    //   overrideTest
    // };
    //
    // if (!this.router.url.includes('/public/')) {
    //   if (!codePrefix && classCode) {
    //     codePrefix = classCode.match(/^[A-Za-z]+\d+/)?.[0] || '';
    //   }
    //   const resp = await firstValueFrom(this.classService.getAll({codePrefix}));
    //   const classes = (resp.data || []).sort((a, b) => {
    //     if (a.code === classCode) return -1;
    //     if (b.code === classCode) return 1;
    //     return a.code && b.code ? a.code.localeCompare(b.code) : 0;
    //   });
    //   if (classes.length > 1) {
    //     testContext.hasNext = true;
    //   }
    // }
    this.modal()?.open(context || {}).afterClosed().pipe(take(1)).subscribe((resp: any) => {
      if (!resp && this.nextMode) {
        this.openEventSelect();
      }
    });
  }

  openEventSelect () {
    const ref = this.eventSelectModal()?.open();
    ref?.afterClosed().pipe(take(1))
      .subscribe((value: any) => {
        if (!value) {
          this.nextMode = false;
        }
      });
  }

  async reset(event?: LessonEvent) {
    this.event = event || new LessonEvent();
    this.overrideData = this.copyData(this.data, this.event);
    // this.form.reset();
    // this.dialogData.item = this.event;
    // this.lessonId = this.event.lesson?.id || 0;
    //
    // this.dialogData = {
    //   item: this.event,
    //   lessonId: this.event.lesson?.id || 0,
    //   timeScheduleId: this.event.frequency?.timeSchedule?.id || 0,
    //   date: this.event.date,
    //   action: 'edit',
    //   colorBy: newColorBy(),
    //   classHash: ''
    // }
    // this.construct();
    // await this.ngOnInit();
    // this.cdr.detectChanges();
  }

  copyData(data: T, event?: LessonEvent): T | null {
    if (data instanceof Test) {
      return Object.assign(new Test(), data, {
        id: undefined,
        curricularComponent: event?.curricularComponent ?? data.curricularComponent,
        lessonId: event?.lesson?.id || 0,
        curricularComponentId: event?.curricularComponent?.id || 0,
        timeScheduleId: event?.frequency?.timeSchedule?.id || 0,
        date: event?.date || ''
      } as Partial<Test>);

      // return new Test({
      //   type: data.type,
      //   curricularComponent: event?.curricularComponent ?? data.curricularComponent,
      //   title: data.title,
      //   content: data.content,
      //   score: data.score,
      //   whereToFindIt: data.whereToFindIt,
      //   lessonId: event?.lesson?.id || 0,
      //   curricularComponentId: event?.curricularComponent?.id || 0,
      //   timeScheduleId: event?.frequency?.timeSchedule?.id || 0,
      //   date: event?.date || ''
      // });
    }
    if (data instanceof Work) {
      return Object.assign(new Work(), data, {
        id: undefined,
        date: event?.date || '',
        lesson: event?.lesson,
        lessonId: event?.lesson?.id || 0,
        timeScheduleId: event?.frequency?.timeSchedule?.id || 0,
      } as Partial<Work>);
    }

    return null;
  }

}

// const d = new ForDuplicate(Work, new ModalComponent());
