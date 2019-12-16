import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/notification';
import { OrganizationAlgoliaResult, OrganizationsIndex } from '@blockframes/utils';
import { Index } from 'algoliasearch';

@Component({
  selector: 'organization-find',
  templateUrl: './organization-find.component.html',
  styleUrls: ['./organization-find.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationFindComponent implements OnInit {
  public selected: OrganizationAlgoliaResult;
  public searchResults$: Observable<OrganizationAlgoliaResult[]>;
  public orgControl = new FormControl();

  constructor(
    @Inject(OrganizationsIndex) private organizationIndex: Index,
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.searchResults$ = this.orgControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(denomination => {
        return new Promise<OrganizationAlgoliaResult[]>((res, rej) => {
          this.organizationIndex.search(denomination, (err, result) => (err ? rej(err) : res(result.hits)));
        });
      })
    )
  }

  public selectOrganization(result: OrganizationAlgoliaResult) {
    this.selected = result;
  }

  public async requestToJoinOrganization() {
    if (this.selected) {
      try {
        await this.invitationService.sendInvitationToOrg(this.selected.objectID);
        this.snackBar.open('Request sent !', 'close', { duration: 2000});
        return this.router.navigate(['layout/organization/home']);
      } catch (error) {
        this.snackBar.open(error.message, 'close', { duration: 2000 });
      }
    }
    else {
      this.snackBar.open('Please select an organization', 'close', { duration: 2000 });
    }
  }
}
