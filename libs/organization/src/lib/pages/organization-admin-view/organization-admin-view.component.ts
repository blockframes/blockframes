import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '../../+state';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';

// TODO #638: delete this mock values
const mockcreatedActionGroup = [
  {
    groupName: 'Action1',
    members: ['Hannah Arendt', 'Albert Camus', 'Immanuel Kant'],
    active: ['Hannah Arendt', 'Albert Camus']
  },
  {
    groupName: 'Action2',
    members: ['Hannah Arendt', 'Albert Camus', 'Immanuel Kant'],
    active: ['Hannah Arendt', 'Immanuel Kant', 'Albert Camus']
  },
  {
    groupName: 'Action3',
    members: ['Hannah Arendt', 'Friedrich Nietzsche'],
    active: ['Hannah Arendt']
  }
];
const mockSignersOfOrganization = [
  {
    name: 'Hannah Arendt',
    email: 'hannahfunnah@gmail.com',
    activeOn: ['Action1', 'Action2', 'Action3']
  },
  { name: 'Albert Camus', email: 'camussamus@gmail.com', activeOn: ['Action1', 'Action2'] },
  {
    name: 'Immanuel Kant',
    email: 'imperativ@gmail.com',
    activeOn: ['Action2']
  }
];

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit {
  /** Flag to indicate if the sidenav is open or not */
  public opened = false;

  /** Variable to save the current orgranization name */
  public organizationName: string;

  /** Observable of created action groups */
  // TODO #638 replace any and of operator
  public createdActionGroups$: Observable<any> = of(mockcreatedActionGroup);

  /** Observable of organization signers */
  // TODO #638 replace any and of operator
  public organizationSigners$: Observable<any> = of(mockSignersOfOrganization);

  /** A variable for the sidenav which members should be shown */
  // TODO #638: replace any
  public actionMembers: any[] = [];

  /** A variable for the sidenav which signer is going to edit */
  // TODO #638: replace any
  public signerOptions: any;

  /**
   * A flag which determine whether to show the options or the members in the sidenav
   *  true means members, false means options
   */
  public optionsOrMember: boolean;

  /** Form control for adding a new signer to a organization */
  public signerFormControl: FormControl = new FormControl();

  constructor(private query: OrganizationQuery) {}

  ngOnInit() {
    this.organizationName = this.query.getValue().org.name;
  }

  // TODO #638: replace any refactor the function when you know how the real data is going to look like
  // also the sidenav is going to need a refactoring
  public openDetails(members: string[]) {
    this.optionsOrMember = true;
    if (JSON.stringify(members) !== JSON.stringify(this.actionMembers)) {
      this.actionMembers = members;
      this.opened = true;
    } else {
      this.opened = false;
      this.actionMembers = [];
    }
  }

  /**
   * TODO #638: this function should really delete a user from the action.
   * So it is going to alter the state of the store.
   * Right now it is more than just a console.log('not implemented yet')
   */
  public deleteUser(member: string) {
    const filteredUsers = this.actionMembers.filter(x => {
      return x !== member;
    });
    this.actionMembers = filteredUsers;
  }

  /** This function is going to open up the option panel for a specific member */
  // TODO #638: this function need to query the correct user and displays the available options
  public openOptions(name: string) {
    this.optionsOrMember = false;
    if (name !== this.signerOptions) {
      this.opened = !this.opened;
    }
    this.signerOptions = name;
  }

  /** This function is going to add a signer to a organization */
  // TODO #638: first this function need to search for all possible signers and then add them to the organization.
  public addSignatory(signer: string) {
    mockSignersOfOrganization.push({ name: signer, email: 'test@gmx.fr', activeOn: [] });
  }
}
