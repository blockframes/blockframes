import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StakeholderService, createMovieStakeholder } from '../../+state';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie/movie/+state';
import { Subject } from 'rxjs';

interface Organization {
  id: string;
  name?: string;
}

@Component({
  selector: 'stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent implements OnInit, OnDestroy {
  public addStakeholderForm: FormGroup;
  public orgOptions: Organization[];
  private destroyed$ = new Subject();

  constructor(
    private service: StakeholderService,
    private builder: FormBuilder,
    private movieQuery: MovieQuery
  ) {}

  ngOnInit() {
    this.orgOptions = [];
    this.addStakeholderForm = this.builder.group({
      org: null
    });
    this.onChange();
  }

  public submit(org: Partial<Organization>) {
    // TODO: handle promises correctly (update loading status, send back error report, etc).
    this.service.addStakeholder(this.movieQuery.getActiveId(), org);
  }

  public displayFn(org?: Organization): string | undefined {
    return org ? org.name : undefined;
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
