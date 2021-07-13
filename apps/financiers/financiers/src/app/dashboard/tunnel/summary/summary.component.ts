import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ConsentsService } from '@blockframes/consents/+state/consents.service';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';

@Component({
  selector: 'financiers-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit {
  form = this.shell.getForm('movie');
  campaignForm = this.shell.getForm('campaign');
  missingFields: string[] = [];
  invalidFields: string[] = [];
  isPublished$ = this.query.selectActive(movie => movie.app.financiers.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private consentsService: ConsentsService,
    private movieQuery: MovieQuery,
    private dialog: MatDialog
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit(): void {
    const { missingFields, errorFields } = findInvalidControls(this.form)
    this.invalidFields = errorFields;
    this.missingFields = missingFields;
  }

  public async submit() {
    const movieId = this.movieQuery.getActiveId();
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Confidentiality Reminder',
        subtitle: 'You are about to submit your project for publication. We kindly remind you that some of the information you\'re about to share might be confidential.',
        text: 'By submitting your project, you assume the responsibility of disclosing all of the information previously filled out to potential future investors. Before submitting your project, please confirm by writing “I AGREE” in the field below.',
        confirmationWord: 'i agree',
        confirmButtonText: 'accept',
        onConfirm: async () => {
          try {
            await this.shell.layout.update({ publishing: true });
            await this.consentsService.createConsent('share', movieId);
            const text = `${this.form.get('title').get('international').value} was successfully submitted.`;
            const ref = this.snackBar.open(text, '', { duration: 1000 });
            ref.afterDismissed().subscribe(() => this.router.navigate(['../end'], { relativeTo: this.route }))
          } catch (err) {
            console.error(err);
            // Log the invalid forms
            if (this.invalidFields.length) {
              this.snackBar.open('Some fields have invalid information.', '', { duration: 2000 });
            } else if (this.missingFields.length) {
              this.snackBar.open('Mandatory information is missing.', '', { duration: 2000 });
            }
          }
        }
      }
    });
  }
}
