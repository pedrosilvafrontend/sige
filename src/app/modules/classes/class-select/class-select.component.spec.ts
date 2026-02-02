import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSelectComponent } from './class-select.component';

describe('ClassSelectComponent', () => {
  let component: ClassSelectComponent;
  let fixture: ComponentFixture<ClassSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
