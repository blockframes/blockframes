import { Component, OnInit } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  public organizationForm: OrganizationForm;

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService,
  ) { }

  ngOnInit() {
    this.organizationForm = new OrganizationForm(this.organizationService)
  }

}
