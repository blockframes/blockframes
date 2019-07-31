import { OrganizationForm, OrganizationOperationForm } from './../../organization.form';
import { Organization, OrganizationMember, OrganizationOperation } from './../../+state/organization.model';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '../../+state';
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
  public organization$ = new Observable<Organization>();

  public operationForm: OrganizationOperationForm;

  /** Form control for adding a new signer to a organization */
  public signerFormControl = new FormControl();

  /** Flag to indicate if sidenav is open */
  public opened = false;

  /** Variable to indicate whether to show an action in the sidenav or a member */
  public editContent: 'operation' | 'member';

  /** A number to indicate which action we want to alter in the sidenav */
  public activeForm: number;

  constructor(private query: OrganizationQuery, private service: OrganizationService) {}

  ngOnInit() {
    this.organization$ = this.query.select('org');//.pipe(
      // tap(org => (this.form = new OrganizationForm(org))),
      // switchMap(org => this.form.valueChanges.pipe(startWith(org)))
    // );
    this.operationForm = new OrganizationOperationForm(null);
  }

  public openSidenavOperation(operation: OrganizationOperation) {
    this.opened = true;
    this.editContent = 'operation';
    this.operationForm = new OrganizationOperationForm(operation);
    // this.optionsOrSigner = true;
    // this.action = action;
  }

  public deleteActiveSigner({member, operation}: {member: OrganizationMember, operation: OrganizationOperation}) {
    this.service.removeOperationMember(operation.id, member);
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
