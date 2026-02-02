import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '@modules/address/address';

@Pipe({
  name: 'address',
  standalone: true
})
export class AddressPipe implements PipeTransform {

  transform(address: Address | undefined): string {
    return address?.address ?
      address.address
      +' '+ address.number
      +', '+ address.city
      +', '+ address.state
      : '';
  }

}
