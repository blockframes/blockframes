import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization, AddressSet } from '../+state';

@Pipe({ name: 'orgAddress', pure: true })
export class OrgAddressPipe implements PipeTransform {
  transform(org: Organization, set: keyof AddressSet = 'main') {
    const { street, zipCode, city, country } = org.addresses[set];
    return `${street}, ${zipCode} ${city}, ${country}`;
  }
}

@NgModule({
  declarations: [OrgAddressPipe],
  exports: [OrgAddressPipe]
})
export class OrgAddressModule {}