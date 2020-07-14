import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from '../../+state';
import { BehaviorSubject } from 'rxjs';
import { OrganizationForm } from '../../forms/organization.form';
import { HostedMediaForm } from '@blockframes/media/directives/media/media.form';

@Component({
  selector: 'organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent {

  public form = new OrganizationForm();
  public media = new HostedMediaForm();
  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
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
    this.router.navigate(['../app-access'], { relativeTo: this.route });
  }
}
