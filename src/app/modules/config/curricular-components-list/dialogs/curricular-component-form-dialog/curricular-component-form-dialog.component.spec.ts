import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurricularComponentFormDialogComponent } from './curricular-component-form-dialog.component';

describe('FormDialogComponent', () => {
  let component: CurricularComponentFormDialogComponent;
  let fixture: ComponentFixture<CurricularComponentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CurricularComponentFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurricularComponentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
