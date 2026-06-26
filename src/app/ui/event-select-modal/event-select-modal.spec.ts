import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSelectModal } from './event-select-modal';

describe('EventSelectModal', () => {
  let component: EventSelectModal;
  let fixture: ComponentFixture<EventSelectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSelectModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSelectModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
