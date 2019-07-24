import { Organization, OrganizationAction } from './../../+state/organization.model';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '../../+state';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit, OnDestroy {

  /** Observable that contains all the signers in an organization */
  public organization$: Observable<Organization>;

  /** Variable for holding the active members on a specific action */
  public action: OrganizationAction;

  /**
   * A flag which determine whether to show the options of a signer or 
   * the members of an action in the sidenav
   * true means action members, false means options of signers
   */
  public optionsOrSigner: boolean;

  /** Form control for adding a new signer to a organization */
  public signerFormControl = new FormControl();

  /** Flag to indicate if sidenav is open */
  public opened = false;

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService
  ) {}

  ngOnInit() {
    this.organization$ = this.query.select('org');
  }

  public openDetails(action: OrganizationAction) {
    this.opened = true;
    this.optionsOrSigner = true;
    this.action = action;
  }

  public deleteActiveSigner({member, action}) {
    this.service.deleteActiveSigner(member, action);
  } 

  /** This function should get triggered by the input field */
  public addSigner(name: string) {
    // TODO(PL): Add a signer to the organization. Also the input field should 
    // have some autocompletion thing, where to look for the correct member?
    console.log('implement me in the service ' + name);
  }

  ngOnDestroy() {
    // TODO(PL): Implement the subscription
    // this.subscription.unsubscribe();
  }
}
