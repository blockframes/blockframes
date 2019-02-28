import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createIp, IpHashContract, IpQuery, IpService, IpState } from '@blockframes/ip';
import { AuthQuery, User } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { first, takeWhile } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ip-org-form',
  templateUrl: './form-organization.component.html',
  styleUrls: ['./form-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormOrganizationComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin<IpState>;
  public user: User;
  public form: FormGroup;
  private alive = true;

  constructor(
    private service: IpService,
    private query: IpQuery,
    private auth: AuthQuery,
    private snackBar: MatSnackBar,
    private contract: IpHashContract,
    private builder: FormBuilder,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.user = this.auth.user;
    this.form = this.builder.group({
      'id': [''],
      'name': ['', [Validators.required]]
    });
    this.persistForm = new PersistNgFormPlugin(this.query, 'form');
    this.persistForm.setForm(this.form);
    this.route.data
      .pipe(takeWhile(_ => this.alive))
      .subscribe(({ ip }) => ip ? this.form.setValue(createIp(ip)) : this.form.reset());
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
    await this.service.add(this.form.value);
    this.snackBar.open(`Created ${this.form.get('title').value}`, 'close', { duration: 1000 });
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
