import { TestBed } from '@angular/core/testing';

import { CurricularComponentsService } from '@services/curricular-components.service';

describe('SubjectsService', () => {
  let service: CurricularComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurricularComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
