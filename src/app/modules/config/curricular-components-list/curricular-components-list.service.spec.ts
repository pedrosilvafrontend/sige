import { TestBed } from '@angular/core/testing';

import { CurricularComponentsListService } from './curricular-components-list.service';

describe('SubjectsService', () => {
  let service: CurricularComponentsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurricularComponentsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
