import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLesson } from './grid-lesson';

describe('GridLesson', () => {
  let component: GridLesson;
  let fixture: ComponentFixture<GridLesson>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridLesson]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridLesson);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
