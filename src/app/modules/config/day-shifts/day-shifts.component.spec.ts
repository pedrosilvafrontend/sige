import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayShiftsComponent } from './day-shifts.component';

describe('SubjectsComponent', () => {
  let component: DayShiftsComponent;
  let fixture: ComponentFixture<DayShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
