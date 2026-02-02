import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiBadgesComponent } from './multi-badges.component';

describe('MultiBadgesComponent', () => {
  let component: MultiBadgesComponent;
  let fixture: ComponentFixture<MultiBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiBadgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
