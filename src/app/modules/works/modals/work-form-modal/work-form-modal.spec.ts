import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFormModal } from './work-form-modal';

describe('WorkFormModal', () => {
  let component: WorkFormModal;
  let fixture: ComponentFixture<WorkFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
