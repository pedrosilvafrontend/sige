import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolDeleteDialogComponent } from './class-delete.component';

describe('SchoolDeleteComponent', () => {
  let component: SchoolDeleteDialogComponent;
  let fixture: ComponentFixture<SchoolDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SchoolDeleteDialogComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
