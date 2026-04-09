import { TestBed } from '@angular/core/testing';

import { UserColorsService } from './user-colors.service';

describe('UserConfigService', () => {
  let service: UserColorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserColorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
