import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDeleteModal } from './work-delete-modal.component';

describe('DeleteWorkModal', () => {
  let component: WorkDeleteModal;
  let fixture: ComponentFixture<WorkDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkDeleteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkDeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
