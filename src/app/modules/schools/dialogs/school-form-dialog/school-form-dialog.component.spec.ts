import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolFormDialogComponent } from './school-form-dialog.component';

describe('SchoolFormDialogComponent', () => {
  let component: SchoolFormDialogComponent;
  let fixture: ComponentFixture<SchoolFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SchoolFormDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
