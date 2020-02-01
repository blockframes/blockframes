import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../+state';
import { BehaviorSubject } from 'rxjs';
import { OrganizationForm } from '../../forms/organization.form';

@Component({
  selector: 'organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent {
  @HostBinding('attr.page-id') pageId = 'organization-create';

  public form = new OrganizationForm(this.service);
  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

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
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      this.loading$.next(false);
      return;
    }

    await this.service.addOrganization(this.form.value);

    this.snackBar.open(`The organization ${this.form.get('name').value} has been created`, 'close', { duration: 2000 });

    this.router.navigate(['../congratulations'], { relativeTo: this.route });
  }
}
