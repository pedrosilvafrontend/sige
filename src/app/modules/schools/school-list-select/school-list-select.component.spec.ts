import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolListSelectComponent } from './school-list-select.component';

describe('SchoolListSelectComponent', () => {
  let component: SchoolListSelectComponent;
  let fixture: ComponentFixture<SchoolListSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolListSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolListSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
