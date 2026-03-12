import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurricularComponentsListComponent } from './curricular-components-list.component';

describe('SubjectsComponent', () => {
  let component: CurricularComponentsListComponent;
  let fixture: ComponentFixture<CurricularComponentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurricularComponentsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurricularComponentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
