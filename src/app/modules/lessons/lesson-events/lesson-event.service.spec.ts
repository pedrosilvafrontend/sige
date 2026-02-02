import { TestBed } from '@angular/core/testing';

import { LesEventService } from './lesson-event.service';

describe('LesEventService', () => {
  let service: LesEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LesEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
