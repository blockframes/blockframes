import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpState } from '@blockframes/ip';
import { AuthQuery, User } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { first, takeWhile } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { createOrganization, OrganizationQuery, OrganizationService } from '../+state';

@Component({
  selector: 'org-form',
  templateUrl: './org-form.component.html',
  styleUrls: ['./org-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgFormComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin<IpState>;
  public user: User;
  public form: FormGroup;
  private alive = true;

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
      .pipe(takeWhile(_ => this.alive))
      .subscribe(({ org }) => org ? this.form.setValue(createOrganization(org)) : this.form.reset());
  }

  ngOnDestroy() {
    this.alive = false;
    this.persistForm.destroy();
  }

  /////////////
  // ACTIONS //
  /////////////

  /** Add a new IP to the list of ips */
  public async submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }

    const id = await this.service.add(this.form.value, await this.user.uid);
    this.router.navigate(['../', id], { relativeTo: this.route });

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
