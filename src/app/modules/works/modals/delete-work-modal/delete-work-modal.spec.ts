import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWorkModal } from './delete-work-modal';

describe('DeleteWorkModal', () => {
  let component: DeleteWorkModal;
  let fixture: ComponentFixture<DeleteWorkModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteWorkModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteWorkModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
