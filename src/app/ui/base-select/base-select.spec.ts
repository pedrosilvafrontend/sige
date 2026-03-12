import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSelect } from './base-select';

type SelectObjectTest = { id: number; value: string; }

describe('BaseSelect', () => {
  let component: BaseSelect<SelectObjectTest>;
  let fixture: ComponentFixture<BaseSelect<SelectObjectTest>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseSelect]
    })
    .compileComponents();

    // @ts-ignore
    fixture = TestBed.createComponent(BaseSelect<SelectObjectTest>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
