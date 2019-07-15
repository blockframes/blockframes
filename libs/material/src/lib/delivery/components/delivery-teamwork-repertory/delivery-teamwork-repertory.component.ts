import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StakeholderService } from '@blockframes/movie';
import { DeliveryQuery } from '../../+state';

interface Organization {
  id: string;
  name?: string;
}

@Component({
  selector: 'delivery-teamwork-repertory',
  templateUrl: './delivery-teamwork-repertory.component.html',
  styleUrls: ['./delivery-teamwork-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkRepertoryComponent implements OnInit, OnDestroy {
  public addStakeholderForm: FormGroup;
  public orgOptions: Organization[];
  private destroyed$ = new Subject();

  constructor(
    private service: StakeholderService,
    private builder: FormBuilder,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.orgOptions = [];
    this.addStakeholderForm = this.builder.group({
      org: null
    });
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

  private async listOrgsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrgs => matchingOrgs.data);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  private async onChange() {
    this.addStakeholderForm.valueChanges
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
