import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { network, baseEnsDomain } from '@env';
import { getProvider, orgNameToEnsDomain } from '@blockframes/ethers/helpers';
import { OrganizationService } from './../../+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { activities } from '../../+state/organization.firestore';

@Component({
  selector: 'organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {
  activities = activities;
  @Input() form: OrganizationForm;

  constructor(private service: OrganizationService) { }

  get bankAccounts() {
    return this.form.get('bankAccounts');
  }

  /** Check if the `name` field of an Organization create form already exists as an ENS domain */
  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value

    let uniqueOnEthereum = false;
    let uniqueOnFirestore = false;

    const orgENS = orgNameToEnsDomain(orgName, baseEnsDomain);
    const provider = getProvider(network);
    const orgEthAddress = await provider.resolveName(orgENS);
    uniqueOnEthereum = !orgEthAddress ? true : false;

    uniqueOnFirestore = await this.service.orgNameExist(orgName).then(exist => !exist);
    if (!(uniqueOnEthereum && uniqueOnFirestore)) this.form.get('denomination').get('full').setErrors({ notUnique: true });
  }
}
