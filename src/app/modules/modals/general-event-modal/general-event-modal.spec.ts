import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralEventModal } from './general-event-modal';

describe('GeneralEventModal', () => {
  let component: GeneralEventModal;
  let fixture: ComponentFixture<GeneralEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralEventModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
