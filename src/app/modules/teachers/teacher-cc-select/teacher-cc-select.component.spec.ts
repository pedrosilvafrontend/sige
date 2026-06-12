import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCcSelectComponent } from './teacher-cc-select.component';

describe('TeacherSelectComponent', () => {
  let component: TeacherCcSelectComponent;
  let fixture: ComponentFixture<TeacherCcSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherCcSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherCcSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
