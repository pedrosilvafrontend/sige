import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTeacherLesson } from './grid-teacher-lesson';

describe('GridLesson', () => {
  let component: GridTeacherLesson;
  let fixture: ComponentFixture<GridTeacherLesson>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridTeacherLesson]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridTeacherLesson);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
