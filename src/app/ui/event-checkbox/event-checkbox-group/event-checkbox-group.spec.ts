import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCheckboxGroup } from './event-checkbox-group';

describe('EventCheckboxGroup', () => {
  let component: EventCheckboxGroup;
  let fixture: ComponentFixture<EventCheckboxGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCheckboxGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCheckboxGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
