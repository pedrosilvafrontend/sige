import { Component, Input, OnInit, Output } from '@angular/core';
import { FormUtil } from '@core/util/form-util';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Address } from '@modules/address/address';
import { BehaviorSubject } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatError,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    TranslateModule,
    MatIcon,
    MatInput,
    MatSuffix,
    NgxMaskDirective
  ],
  providers: [provideNgxMask({})],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit {
  public form = FormUtil.addressForm();

  @Input() required = false;

  @Input()
  set data(data: Address | undefined) {
    this.form.patchValue(data || {});
  }

  @Output()
  public form$ = new BehaviorSubject(this.form);

  public compare = FormUtil.compare;

  ngOnInit() {
    if (this.required) {
      const { address, number, city, state, country, postalCode } = this.form.controls;
      address.addValidators(Validators.required);
      number.addValidators(Validators.required);
      city.addValidators(Validators.required);
      state.addValidators(Validators.required);
      country.addValidators(Validators.required);
      postalCode.addValidators(Validators.required);
    }
  }

}
