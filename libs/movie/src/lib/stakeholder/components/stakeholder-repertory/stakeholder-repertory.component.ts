import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StakeholderService, createMovieStakeholder } from '../../+state';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';
import { takeUntil } from 'rxjs/operators';
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
    private movieQuery: MovieQuery,
  ) {}

  ngOnInit() {
    this.orgOptions = [];
    this.addStakeholderForm = this.builder.group({
      org: null
    });
    this.onChange();
  }

  public submit(org: Organization) {
    const sh = createMovieStakeholder({ orgId: org.id });

    // TODO: handle promises correctly (update loading status, send back error report, etc).
    this.service.add(this.movieQuery.getActiveId(), sh);
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(typingOrgName => {
        // TODO: debounce
        this.listOrgsByName(typingOrgName.org).then(matchingOrgs => {
          // TODO: use an observable
          this.orgOptions = matchingOrgs;
        });
      });
  }
}
