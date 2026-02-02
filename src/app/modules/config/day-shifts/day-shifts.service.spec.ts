import { TestBed } from '@angular/core/testing';

import { DayShiftsService } from './day-shifts.service';

describe('SubjectsService', () => {
  let service: DayShiftsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayShiftsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
