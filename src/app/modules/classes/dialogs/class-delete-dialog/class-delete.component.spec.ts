import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassDeleteDialogComponent } from './class-delete.component';


describe('SchoolDeleteComponent', () => {
  let component: ClassDeleteDialogComponent;
  let fixture: ComponentFixture<ClassDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ClassDeleteDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
