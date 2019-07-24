import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Organization } from '../../+state';
import firebase from 'firebase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/notification';

@Component({
  selector: 'organization-find',
  templateUrl: './organization-find.component.html',
  styleUrls: ['./organization-find.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationFindComponent implements OnInit, OnDestroy {
  private selected: Partial<Organization>;
  private destroyed$ = new Subject();

  public orgControl = new FormControl();
  public orgOptions: Organization[];

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.orgOptions = [];
    // TODO: issue#577 new search function
    this.onChange();
  }

  public selectOrganization(organization: Partial<Organization>) {
    this.selected = organization;
  }

  public addOrganization() {
    if (this.selected) {
      try {
        this.invitationService.sendInvitationToOrg(this.selected);
        this.router.navigate(['layout/create-organization/congratulation']);
      } catch (error) {
        this.snackBar.open(error.message, 'close', { duration: 2000 });
      }
    }
    else {
      this.snackBar.open('Please select an organization', 'close', { duration: 2000 });
    }
  }

  // TODO: issue#577 new search function
  private async listOrgsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrgs => matchingOrgs.data);
  }

  private onChange() {
    this.orgControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      ).subscribe(async typingOrgName => {
        this.orgOptions = await this.listOrgsByName(typingOrgName);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
