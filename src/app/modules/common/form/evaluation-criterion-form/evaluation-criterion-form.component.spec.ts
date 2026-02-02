import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationCriterionFormComponent } from './evaluation-criterion-form.component';

describe('EvaluationCriterionFormComponent', () => {
  let component: EvaluationCriterionFormComponent;
  let fixture: ComponentFixture<EvaluationCriterionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationCriterionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationCriterionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
