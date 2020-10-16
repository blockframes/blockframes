import { algolia } from '@env';
import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractPartyDetail } from '@blockframes/contract/contract/+state/contract.model';
import { PartyDetailsForm } from '@blockframes/contract/contract/form/contract.form';
import { legalRoles, subLicensorRoles, contractStatus } from '@blockframes/utils/static-model';

interface PartyDialogData {
  title: string,
  subtitle: string,
  party: ContractPartyDetail
}

@Component({
  selector: 'admin-edit-party',
  templateUrl: './edit-party.component.html',
  styleUrls: ['./edit-party.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPartyComponent implements OnInit {
  public form: PartyDetailsForm;
  public statuses = contractStatus;
  public staticRoles = legalRoles;
  public staticSubRoles = subLicensorRoles;
  public algoliaOrg = algolia.indexNameOrganizations;
  public resetInput = false;

  constructor(
    public dialogRef: MatDialogRef<EditPartyComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: PartyDialogData,
  ) { }

  ngOnInit() {
    this.form = new PartyDetailsForm(this.data.party);
  }

  public patchOrgId(result: any) {
    this.form.get('party').get('orgId').setValue(result.objectID);
  }

  save() {
    if (this.form.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return false;
    }
    this.dialogRef.close(this.form.value);
  }

  removeParty() {
    this.dialogRef.close({ remove: true });
  }

  get displayName() {
    return this.form.get('party').get('displayName');
  }

  public childRoleForm() {
    return this.form.get('childRoles');
  }
}
