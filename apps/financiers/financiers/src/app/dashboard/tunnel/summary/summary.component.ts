import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ConsentsService } from '@blockframes/consents/+state/consents.service';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { CrmFormDialogComponent } from '@blockframes/admin/admin-panel/components/crm-form-dialog/crm-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

@Component({
  selector: 'financiers-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');
  campaignForm = this.shell.getForm('campaign');
  subscription: Subscription;
  missingFields: string[] = [];
  invalidFields: string[] = [];
  isPublished$ = this.query.selectActive(movie => movie.storeConfig.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private query: MovieQuery,
    private queryOrg: OrganizationQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private consentsService: ConsentsService,
    private dialog: MatDialog
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit(): void {
    this.missingFields = findInvalidControls(this.form);
    this.subscription = this.form.valueChanges.subscribe(() => this.missingFields = findInvalidControls(this.form));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async submit() {
    const orgId = this.queryOrg.getActiveId();
    this.dialog.open(CrmFormDialogComponent, {
      data: {
        title: 'Confidentiality Reminder',
        subTitle: 'You are about to submit your project for publication. We kindly remind you that some of the information you\'re about to share might be confidential.',
        text: 'By submitting your project, you assume the responsibility of disclosing all of the information previously filled out to potential future investors. Before submitting your project, please confirm by writing “I AGREE” in the field below.',
        confirmationWord: 'i agree',
        confirmButtonText: 'accept',
        onConfirm: async () => {
          try {
            await this.shell.layout.update({ publishing: true });
            await this.consentsService.createConsent('share', orgId);
            const ref = this.snackBar.open('Your title was successfully submitted!', '', { duration: 1000 });
            ref.afterDismissed().subscribe(_ => this.router.navigate(['../end'], { relativeTo: this.route }))
          } catch (err) {
            console.error(err);
            // Log the invalid forms
            this.snackBar.open('Fill all mandatory fields before submitting', '', { duration: 2000 });
          }
        }
      }
    })
  }

}
