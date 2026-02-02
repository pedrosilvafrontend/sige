import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEventsComponent } from './lesson-events.component';

describe('LesEventsComponent', () => {
  let component: LessonEventsComponent;
  let fixture: ComponentFixture<LessonEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
