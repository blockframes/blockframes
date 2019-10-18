import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery, User } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { first, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { createOrganization, OrganizationQuery, OrganizationService, OrganizationState } from '../../+state';
import { Subject, BehaviorSubject } from 'rxjs';
import { UniqueOrgName } from '@blockframes/utils';

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
  private destroyed$ = new Subject();

  public loading$ = new BehaviorSubject<boolean>(false);

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
    this.user = this.auth.user;
    this.form = this.builder.group({
      'name': new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [UniqueOrgName],
        updateOn: 'blur',
      }),
      'officeAddress': ['', [Validators.required]]
    });

    this.form.statusChanges.subscribe(status => {
      if (status === 'PENDING') {
        this.loading$.next(true);
      } else {
        this.loading$.next(false);
      }
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

  public get name() {
    return this.form.get('name').value;
  }

  public get notProvided() {
    return this.form.get('name').hasError('required');
  }

  public get notUnique() {
    return this.form.get('name').hasError('notUnique');
  }

  /** Add a new Organization */
  public async addOrganization() {
    this.loading$.next(true);

    if (!this.form.valid) {
      this.snackBar.open('Form invalid', 'close', { duration: 1000 });
      this.loading$.next(false);
      return;
    }

    const id = await this.service.add(this.form.value, await this.user);

    this.snackBar.open(`Created ${this.form.get('name').value}`, 'close', { duration: 1000 });
    this.persistForm.reset();
    this.router.navigate(['layout/o/organization', id]);
  }

  /** Clear current form with cancellation */
  public clear() {
    const oldState = this.form.value;
    this.form.reset();
    this.persistForm.reset();
    this.snackBar.open('Cleared', 'Cancel', { duration: 1000 })
      .onAction()
      .pipe(first())
      .subscribe(_ => this.form.setValue(oldState));
  }
}
