import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesCountComponent } from './activities-count.component';

describe('ActivitiesCountComponent', () => {
  let component: ActivitiesCountComponent;
  let fixture: ComponentFixture<ActivitiesCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
