import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayShiftsFormDialogComponent } from './day-shifts-form-dialog.component';

describe('DayShiftsFormDialogComponent', () => {
  let component: DayShiftsFormDialogComponent;
  let fixture: ComponentFixture<DayShiftsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DayShiftsFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayShiftsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
