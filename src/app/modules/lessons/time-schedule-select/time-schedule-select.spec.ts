import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeScheduleSelect } from './time-schedule-select';

describe('TimeScheduleSelect', () => {
  let component: TimeScheduleSelect;
  let fixture: ComponentFixture<TimeScheduleSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeScheduleSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeScheduleSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
