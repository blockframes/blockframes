import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StakeholderService } from '../../+state';
import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { Subject } from 'rxjs';
import { Organization, OrganizationService } from '@blockframes/organization';

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

  constructor(
    private service: StakeholderService,
    private movieQuery: MovieQuery,
    private organizationService: OrganizationService
  ) {}

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

  private async onChange() {
    this.stakeholderForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(async stakeholderName => {
        this.organizations = await this.organizationService.getOrganizationsByName(stakeholderName);
        // TODO: use an observable => ISSUE#608
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
