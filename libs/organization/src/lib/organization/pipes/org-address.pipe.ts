import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { AddressSet, Organization, territories } from '@blockframes/model';

@Pipe({ name: 'orgAddress' })
export class OrgAddressPipe implements PipeTransform {
  transform(org: Organization, set: keyof AddressSet = 'main') {
    const { street, zipCode, city, country } = org.addresses[set];
    if (street && zipCode && city && country) {
      const countryLabel = territories[country];
      return `${street}, ${zipCode} ${city}, ${countryLabel}`;
    }
    if (country) {
      return territories[country];
    }
  }
}

@NgModule({
  declarations: [OrgAddressPipe],
  exports: [OrgAddressPipe]
})
export class OrgAddressModule { }
