import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { StakeholderService, createStakeholder } from '../+state';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';
import { takeWhile } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie/movie/+state';

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
  public addStakeholderForm: FormGroup;
  public orgOptions: Organization[];
  public isAlive = true;

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
    const sh = createStakeholder({ orgId: org.id });

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

  ngOnDestroy() {
    this.isAlive = false;
  }
}
