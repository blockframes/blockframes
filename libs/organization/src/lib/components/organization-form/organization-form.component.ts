import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery, User } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { first, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { createOrganization, OrganizationQuery, OrganizationService, OrganizationState } from '../../+state';
import { Subject } from 'rxjs';

@Component({
  selector: 'organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin<OrganizationState>;
  public user: User;
  public form: FormGroup;
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
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      return;
    }

    const id = await this.service.add(this.form.value, await this.user);

    this.router.navigate(['layout/o/organization', id])
    this.snackBar.open(`Created ${this.form.get('name').value}`, 'close', { duration: 1000 });
    this.form.reset();
    this.persistForm.reset();
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
