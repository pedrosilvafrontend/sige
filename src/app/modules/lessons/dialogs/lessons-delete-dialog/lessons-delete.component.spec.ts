import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsDialogComponent } from '@modules/lessons';

describe('LessonsDialogComponent', () => {
  let component: LessonsDialogComponent;
  let fixture: ComponentFixture<LessonsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LessonsDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
