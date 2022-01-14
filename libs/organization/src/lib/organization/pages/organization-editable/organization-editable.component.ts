import { Component, OnInit } from '@angular/core';
import { OrganizationQuery, OrganizationService, Organization } from '../../+state';
import { PermissionsService } from '@blockframes/permissions/+state';
import { OrganizationForm } from '../../forms/organization.form';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'organization-editable',
  templateUrl: './organization-editable.component.html',
  styleUrls: ['./organization-editable.component.scss'],
})
export class OrganizationEditableComponent implements OnInit {
  public opened = false;
  public organizationProfileForm = new OrganizationForm();
  public organization$: Observable<Organization>;
  public isAdmin$: Observable<boolean>;

  constructor(
    private query: OrganizationQuery,
    private permissionsService: PermissionsService,
    private service: OrganizationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.organization$ = this.query
      .selectActive()
      .pipe(tap(org => this.organizationProfileForm.patchValue(org)));
    this.isAdmin$ = this.permissionsService.isAdmin$;
  }

  public get organizationInformations$() {
    return this.organizationProfileForm.valueChanges.pipe(
      startWith(this.organizationProfileForm.value)
    );
  }

  public openSidenav() {
    this.opened = true;
  }

  public update() {
    try {
      if (this.organizationProfileForm.invalid) {
        throw new Error('Your organization profile informations are not valid');
      }
      this.service.update(this.query.getActiveId(), this.organizationProfileForm.value);
      this.snackBar.open('Organization profile change succesfull', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
