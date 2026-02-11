import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Frequency, ILessonForm, ILessonFrequency, LessonBatch } from '@models';
import { FormValidators } from '@form/form-validators';

export class LessonForm {
  private fb = new FormBuilder();
  public form: FormGroup<ILessonForm>;

  constructor(data?: LessonBatch, origin?: string) {
    this.form = this.createForm(data, origin);
  }

  createForm(data?: LessonBatch, origin?: string): FormGroup<ILessonForm> {
    const isGridOrigin = origin === 'grid';
    const form = this.fb.group(
      {
        id: [data?.id],
        schoolClass: this.fb.control({ value: data?.schoolClass, disabled: isGridOrigin }, [Validators.required]),
        teacher: this.fb.control({ value: data?.teacher, disabled: false }, [Validators.required]),
        curricularComponent: this.fb.control({ value: data?.curricularComponent, disabled: false }, [Validators.required]),
        school: this.fb.control({ value: data?.school, disabled: isGridOrigin }, [Validators.required]),
        date: this.fb.control({ value: data?.date, disabled: isGridOrigin }, [Validators.required]),
        endDate: this.fb.control({ value: data?.endDate, disabled: isGridOrigin }, [Validators.required]),
        frequencies: this.fb.array([] as FormGroup<ILessonFrequency>[]),
        description: this.fb.control({ value: data?.description, disabled: false }),
      },
      {
        validators: [
          FormValidators.dateRange('date', 'endDate')
        ]
      }
    );

    (data?.frequencies || []).forEach(frequency => {
      form.controls.frequencies.push(this.getFrequencyForm(frequency));
    })

    return form as unknown as FormGroup<ILessonForm>;
  }

  getFrequencyForm(data?: Frequency): FormGroup<ILessonFrequency> {
    return this.fb.group<ILessonFrequency>({
      id: this.fb.control(data?.id || 0),
      weekday: this.fb.control(data?.weekday || '', [Validators.required]),
      timeSchedule: this.fb.control(data?.timeSchedule || null, [Validators.required]),
    });
  }

  addFrequency(data?: Frequency) {
    const frequencies = this.form.controls.frequencies as FormArray;
    frequencies.push(this.getFrequencyForm(data));
  }

  removeFrequency(index: number) {
    const frequencies = this.form.controls.frequencies as any;
    frequencies.removeAt(index);
  }

  patchValue(data?: LessonBatch) {
    this.form.patchValue(data as any);
    this.form.controls.frequencies.clear();
    (data?.frequencies || []).forEach(frequency => {
      this.addFrequency(frequency);
    })
  }

}
