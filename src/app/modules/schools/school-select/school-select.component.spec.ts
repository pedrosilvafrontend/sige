import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSelectComponent } from './school-select.component';

describe('SchoolSelectComponent', () => {
  let component: SchoolSelectComponent;
  let fixture: ComponentFixture<SchoolSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
