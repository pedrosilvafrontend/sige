import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCheckbox } from './event-checkbox';

describe('EventCheckbox', () => {
  let component: EventCheckbox;
  let fixture: ComponentFixture<EventCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCheckbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCheckbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
