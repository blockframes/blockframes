import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Organization, OrganizationQuery, OrganizationService } from '../../+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationEditComponent implements OnInit, OnDestroy {
  public organizationForm = new FormControl();
  public organization$: Observable<Organization>;
  private destroyed$ = new Subject();

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.organization$ = this.query.select('org');
  }

  public updateOrganization() {
    if (!this.organizationForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    try {
      this.service.update({ address: this.organizationForm.value });
      this.snackBar.open(`Organization updated`, 'close', { duration: 2000 });
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
