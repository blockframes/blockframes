import { network, baseEnsDomain } from '@env';
import { getProvider, orgNameToEnsDomain } from '@blockframes/ethers/helpers';
import { OrganizationService } from './../../+state/organization.service';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';

@Component({
  selector: 'organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  @Input() form: OrganizationForm;

  private sub: Subscription;

  constructor(private service: OrganizationService) { }

  ngOnInit() {
    this.sub = this.form.get('name').valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(name => this.uniqueOrgName(name))
    ).subscribe();
  }

  get bankAccounts() {
    return this.form.get('bankAccounts');
  }

  /** Check if the `name` field of an Organization create form already exists as an ENS domain */
  private async uniqueOrgName(name: string) {

    let uniqueOnEthereum = false;
    let uniqueOnFirestore = false;

    const orgENS = orgNameToEnsDomain(name, baseEnsDomain);
    const provider = getProvider(network);
    const orgEthAddress = await provider.resolveName(orgENS);
    uniqueOnEthereum = !orgEthAddress ? true : false;

    uniqueOnFirestore = await this.service.orgNameExist(name).then(exist => !exist);
    (uniqueOnEthereum && uniqueOnFirestore) ? null : this.form.get('name').setErrors({ notUnique: true });
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
