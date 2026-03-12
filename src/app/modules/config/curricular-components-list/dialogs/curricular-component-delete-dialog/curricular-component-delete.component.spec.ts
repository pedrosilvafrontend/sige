import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CurricularComponentDeleteDialogComponent
} from '@modules/config/curricular-components-list/dialogs/curricular-component-delete-dialog/curricular-component-delete.component';
import {MatDialogModule} from '@angular/material/dialog';


describe('CurricularComponentDeleteDialogComponent', () => {
  let component: CurricularComponentDeleteDialogComponent;
  let fixture: ComponentFixture<CurricularComponentDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CurricularComponentDeleteDialogComponent, MatDialogModule]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurricularComponentDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
