import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Observable, Subscription } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {
  public organizationForm = new OrganizationForm(this.service);
  public organization$: Observable<Organization>;
  public sub: Subscription;
  
  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
  ) { }

  ngOnInit() {
    this.sub = this.query
      .selectActive()
      .subscribe(org => this.organizationForm.patchValue(org));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
