import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StakeholderService } from '@blockframes/movie';
import { DeliveryQuery } from '../../+state';
import { Organization, OrganizationService } from '@blockframes/organization';

@Component({
  selector: 'delivery-teamwork-repertory',
  templateUrl: './delivery-teamwork-repertory.component.html',
  styleUrls: ['./delivery-teamwork-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkRepertoryComponent implements OnInit, OnDestroy {
  public stakeholderForm = new FormControl();
  public organizations: Organization[];
  private destroyed$ = new Subject();

  constructor(
    private service: StakeholderService,
    private query: DeliveryQuery,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.onChange();
  }

  public submit(organization: Partial<Organization>) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    const delivery = this.query.getActive();
    this.service.addStakeholder(delivery, organization);
  }

  public displayFn(organization?: Organization): string | undefined {
    return organization ? organization.name : undefined;
  }

  private onChange() {
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
