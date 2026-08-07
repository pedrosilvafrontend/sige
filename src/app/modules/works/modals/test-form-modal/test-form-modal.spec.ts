import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormModal } from './test-form-modal';

describe('TestFormModal', () => {
  let component: TestFormModal;
  let fixture: ComponentFixture<TestFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
