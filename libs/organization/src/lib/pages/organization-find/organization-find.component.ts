import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { startWith, map, filter, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Organization, OrganizationService } from '../../+state';
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
  public addOrganizationForm: FormGroup;
  public orgOptions: Organization[];
  private selectedOrganization: Partial<Organization>;
  private destroyed$ = new Subject();

  constructor(
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.orgOptions = [];
    this.addOrganizationForm = this.builder.group({
      org: null
    });
    this.onChange();
  }

  public selectOrganization(organization: Partial<Organization>) {
    this.selectedOrganization = organization;
  }

  public addOrganization() {
    if(this.selectedOrganization) {
      try {
        this.invitationService.sendInvitationToOrg(this.selectedOrganization);
        this.router.navigate(['layout/congratulation']);
      } catch (error) {
        this.snackBar.open(error.message, 'close', { duration: 2000 });
      }
    }
    else {
      this.snackBar.open('Please select an organization', 'close', { duration: 2000 });
    }
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  private async listOrgsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrgs => matchingOrgs.data);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  private async onChange() {
    this.addOrganizationForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      ).subscribe(typingOrgName => {
        this.listOrgsByName(typingOrgName.org).then(matchingOrgs => {
          // TODO: use an observable => ISSUE#608
          this.orgOptions = matchingOrgs;
        });
    });
  }
}
