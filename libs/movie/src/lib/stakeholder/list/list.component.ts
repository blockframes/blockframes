import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Stakeholder, StakeholderService, createStakeholder } from '../+state';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';
import { MovieQuery } from '../../movie/+state';
import { takeWhile } from 'rxjs/operators';

interface Organization {
  id: string;
  name?: string;
}

@Component({
  selector: 'stakeholder-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderListComponent implements OnInit, OnDestroy {
  public stakeholders$: Observable<Stakeholder[]>;
  public addStakeholderForm: FormGroup;
  public orgOptions: Organization[];
  public activeMovieId: string;
  public isAlive = true;

  constructor(
    private service: StakeholderService,
    private builder: FormBuilder,
    private movieQuery: MovieQuery,

  ) { }

  ngOnInit() {
    this.stakeholders$ = this.service.subscribeOnStakeholdersByActiveMovie$();
    this.orgOptions = [];
    this.addStakeholderForm = this.builder.group({
      org: null
    });
    this.onChange();
    this.activeMovieId = this.movieQuery.getActiveId();
  }

  public submit(org: Organization) {
    const sh = createStakeholder({ orgId: org.id });

    // TODO: handle promises correctly (update loading status, send back error report, etc).
    this.service.add(this.activeMovieId, sh);
  }

  public displayFn(org?: Organization): string | undefined {
    return org ? org.name : undefined;
  }

  private async listOrgsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrgs => matchingOrgs.data);
  }

  private async onChange() {
    this.addStakeholderForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(typingOrgName => {
      // TODO: debounce
      this.listOrgsByName(typingOrgName.org)
        .then(matchingOrgs => {
          // TODO: use an observable
          this.orgOptions = matchingOrgs;
        });
    });
  }

  public remove(stakeholderId: string) {
    this.service.remove(this.activeMovieId, stakeholderId);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
