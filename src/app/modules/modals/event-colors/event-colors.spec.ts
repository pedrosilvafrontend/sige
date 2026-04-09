import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventColors } from './event-colors';

describe('EventColors', () => {
  let component: EventColors;
  let fixture: ComponentFixture<EventColors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventColors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventColors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
