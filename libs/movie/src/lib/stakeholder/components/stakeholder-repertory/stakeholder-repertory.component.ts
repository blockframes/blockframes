import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StakeholderService } from '../../+state';
import { FormControl } from '@angular/forms';
import * as firebase from 'firebase';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { Subject } from 'rxjs';
import { Organization } from '@blockframes/organization';

@Component({
  selector: 'stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent implements OnInit, OnDestroy {
  public stakeholderForm = new FormControl();
  public organizations: Organization[];
  private destroyed$ = new Subject();

  constructor(private service: StakeholderService, private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.onChange();
  }

  public submit(organization: Partial<Organization>) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    this.service.addStakeholder(this.movieQuery.getActive(), organization);
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  private async listOrganizationsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrganizations => matchingOrganizations.data);
  }

  private async onChange() {
    this.stakeholderForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(stakeholderName => {
        this.listOrganizationsByName(stakeholderName).then(matchingOrganizations => {
          // TODO: use an observable => ISSUE#608
          this.organizations = matchingOrganizations;
        });
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
