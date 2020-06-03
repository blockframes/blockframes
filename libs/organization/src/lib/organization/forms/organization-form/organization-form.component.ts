import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { network, baseEnsDomain } from '@env';
import { getProvider, orgNameToEnsDomain } from '@blockframes/ethers/helpers';
import { OrganizationService } from './../../+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { orgActivity } from '../../+state/organization.firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {
  activities = orgActivity;

  public storagePath = `orgs/${this.query.getActiveId()}/logo`;
  @Input() form: OrganizationForm;

  // TODO#2914 Reenable the cropper here when we found a solution
  @Input() @boolean disableCropper = false;

  constructor(private service: OrganizationService, private query: OrganizationQuery) { }

  // ISSUE#2692
  // get bankAccounts() {
  //   return this.form.get('bankAccounts');
  // }

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
