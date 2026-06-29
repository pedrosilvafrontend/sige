import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCompareModal } from './test-compare-modal';

describe('TestCompareModal', () => {
  let component: TestCompareModal;
  let fixture: ComponentFixture<TestCompareModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCompareModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCompareModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
