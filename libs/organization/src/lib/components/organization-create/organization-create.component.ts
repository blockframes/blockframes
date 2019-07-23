import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery, User } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { first, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { createOrganization, OrganizationQuery, OrganizationService, OrganizationState } from '../../+state';
import { Subject } from 'rxjs';
import { App, AppInformations, getAppInformations } from '../../permissions/+state';

@Component({
  selector: 'organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin<OrganizationState>;
  public user: User;
  public form: FormGroup;
  public availablesApps: App[] = [
    App.mediaFinanciers,
    App.mediaDelivering,
    App.storiesAndMore,
    App.biggerBoat
  ]
  public applications: AppInformations[];
  public selectedApp: AppInformations;
  private destroyed$ = new Subject();

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.applications = this.availablesApps.map(app => getAppInformations(app));
    this.user = this.auth.user;
    this.form = this.builder.group({
      'id': [''],
      'name': ['', [Validators.required]],
      'address': ['', [Validators.required]]
    });

    this.persistForm = new PersistNgFormPlugin(this.query, 'form');
    this.persistForm.setForm(this.form);
    this.route.data
      .pipe(takeUntil(this.destroyed$))
      .subscribe(({ org }) => org ? this.form.setValue(createOrganization(org)) : this.form.reset());
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
    this.persistForm.destroy();
  }

  /////////////
  // ACTIONS //
  /////////////

  /** Add a new Organization */
  public async addOrganization() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid', 'close', { duration: 1000 });
      return;
    }

    if (!this.selectedApp) {
      this.snackBar.open('You must select a DApp', 'close', { duration: 1000 });
      return;
    }

    await this.service.add(this.form.value, await this.user, this.selectedApp);

    this.router.navigate(['layout/o/organization/view'])
    this.snackBar.open(`Created ${this.form.get('name').value}`, 'close', { duration: 1000 });
    this.form.reset();
    this.persistForm.reset();
  }

  /** Clear current form with cancellation */
  public clear() {
    const oldState = this.form.value;
    this.selectedApp = null;
    this.form.reset();
    this.persistForm.reset();
    this.snackBar.open('Cleared', 'Cancel', { duration: 1000 })
      .onAction()
      .pipe(first())
      .subscribe(_ => this.form.setValue(oldState));
  }
}
