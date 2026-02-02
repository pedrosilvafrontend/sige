import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationGroupForm } from './evaluation-group-form';

describe('EvaluationGroupForm', () => {
  let component: EvaluationGroupForm;
  let fixture: ComponentFixture<EvaluationGroupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationGroupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationGroupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
