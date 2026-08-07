import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDeleteModal } from './test-delete-modal';

describe('TestDeleteModal', () => {
  let component: TestDeleteModal;
  let fixture: ComponentFixture<TestDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDeleteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
