import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicRedirect } from './public-redirect';

describe('PublicRedirect', () => {
  let component: PublicRedirect;
  let fixture: ComponentFixture<PublicRedirect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicRedirect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicRedirect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
