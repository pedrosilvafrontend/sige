import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectDeleteDialogComponent } from './day-shifts-delete.component';

describe('SubjectDeleteDialogComponent', () => {
  let component: SubjectDeleteDialogComponent;
  let fixture: ComponentFixture<SubjectDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SubjectDeleteDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
