import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsFormDialogComponent } from '@modules/lessons';

describe('LessonsFormDialogComponent', () => {
  let component: LessonsFormDialogComponent;
  let fixture: ComponentFixture<LessonsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LessonsFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
