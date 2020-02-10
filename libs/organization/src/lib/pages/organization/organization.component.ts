import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Observable, Subscription } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.sub = this.query
      .selectActive()
      .subscribe(org => this.organizationForm.patchValue(org));
  }

  public update() {
    try {
      if (this.organizationForm.invalid) {
        throw new Error('Your organization profile informations are not valid');
      }
      this.service.update(this.query.getActiveId(), this.organizationForm.value);
      this.snackBar.open('Organization profile change succesfull', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
