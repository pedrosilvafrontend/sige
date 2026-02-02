import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationFormComponent } from '@modules/common/form/evaluation-form/evaluation-form.component';

describe('EvaluationForm', () => {
  let component: EvaluationFormComponent;
  let fixture: ComponentFixture<EvaluationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
