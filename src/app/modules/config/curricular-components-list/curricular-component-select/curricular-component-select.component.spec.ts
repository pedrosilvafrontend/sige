import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurricularComponentSelectComponent } from './curricular-component-select.component';

describe('SubjectSelectComponent', () => {
  let component: CurricularComponentSelectComponent;
  let fixture: ComponentFixture<CurricularComponentSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurricularComponentSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurricularComponentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
