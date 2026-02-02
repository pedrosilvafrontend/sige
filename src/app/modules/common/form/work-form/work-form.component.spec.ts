import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFormComponent } from './work-form.component';

describe('WorkForm', () => {
  let component: WorkFormComponent;
  let fixture: ComponentFixture<WorkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
