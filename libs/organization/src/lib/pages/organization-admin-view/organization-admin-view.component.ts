import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import {
  OrganizationQuery,
  Action,
  OrgMember,
  Organization,
  OrganizationService
} from '../../+state';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit, OnDestroy {
  /** Observable that contains all the information about the current organization */
  public organization$: Observable<Organization>;

  /** Variable to save the current orgranization name */
  public organizationName: string;

  /** A variable for the child component which actions are active */
  public actionMembers: Action[];

  /** A variable for the child component which signer are in an organization */
  public signerOptions: OrgMember;

  /** A subscription on the organization store to get all the signers */
  private subscription: Subscription;
  public form: FormArray;

  /**
   * A flag which determine whether to show the options or the members in the sidenav
   *  true means members, false means options
   */
  public optionsOrMember: boolean;

  /** Form control for adding a new signer to a organization */
  public signerFormControl: FormControl = new FormControl();

  selected = 0;
  values$ = this.form.valueChanges;

  constructor(private query: OrganizationQuery, private service: OrganizationService) {}

  ngOnInit() {
    this.organization$ = this.query.select('org');
    this.subscription = this.query.select('org').subscribe(signers => {
      this.form.patchValue(signers.members);
    });
  }

  public openDetails(index: number) {
    this.optionsOrMember = true;
  }

  public addSigner(name: string) {
    console.log('implement me in the service' + name);
  }

  public save() {
    this.service.update(this.form.value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
