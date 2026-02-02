import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriterionSelect } from './criterion-select';

describe('CriterionSelect', () => {
  let component: CriterionSelect;
  let fixture: ComponentFixture<CriterionSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriterionSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriterionSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
