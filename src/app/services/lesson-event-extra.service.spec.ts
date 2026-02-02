import { TestBed } from '@angular/core/testing';

import { LessonEventExtraService } from './lesson-event-extra.service';

describe('LessonEventExtraService', () => {
  let service: LessonEventExtraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonEventExtraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
