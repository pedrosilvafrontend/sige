import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesFilterFormComponent } from './activities-filter-form.component';

describe('ActivitiesFilterFormComponentTs', () => {
  let component: ActivitiesFilterFormComponent;
  let fixture: ComponentFixture<ActivitiesFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesFilterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesFilterFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
