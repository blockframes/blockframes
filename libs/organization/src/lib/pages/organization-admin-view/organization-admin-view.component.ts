import { OrganizationForm } from './../../organization.form';
import { Organization, OrganizationMember } from './../../+state/organization.model';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '../../+state';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { tap, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit {
  /** Observable that contains all the signers in an organization */
  public organization$: Observable<Organization>;

  public form = new OrganizationForm();

  /** Form control for adding a new signer to a organization */
  public signerFormControl = new FormControl();

  /** Flag to indicate if sidenav is open */
  public opened = false;

  /** Variable to indicate whether to show an action in the sidenav or a member */
  public editContent: 'action' | 'member';

  /** A number to iindicate which action we want to alter in the sidenav */
  public activeForm: number;

  constructor(private query: OrganizationQuery) {}

  ngOnInit() {
    this.organization$ = this.query.select('org').pipe(
      tap(org => (this.form = new OrganizationForm(org))),
      switchMap(org => this.form.valueChanges.pipe(startWith(org)))
    );
  }

  public openSidenav(editContent: 'action' | 'member', index: number) {
    this.opened = true;
    this.editContent = editContent;
    this.activeForm = index;
  }

  /** This function should get triggered by the input field */
  public addSigner(name: string) {
    // TODO(#682): Add a signer to the organization. Also the input field should
    // have some autocompletion, where to look for the correct member?
    console.log('implement me in the service ' + name);
  }

  // TODO(#682)
  public openOptions(editContent: 'action' | 'member', member: OrganizationMember) {
    this.opened = true;
    this.editContent = this.editContent;
  }
}
