import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ConsentsService } from '@blockframes/consents/+state/consents.service';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component';
import { map, pluck, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/snackbar-error.component';

@Component({
  selector: 'financiers-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit {
  form = this.shell.getForm('movie');
  campaignForm = this.shell.getForm('campaign');
  // Fields displayed in component that are in error or missing but mandatory
  blockingFields: string[] = [];
  // Missing but mandatory fields
  private missingFields: string[] = [];
  // Fields in error
  private invalidFields: string[] = [];

  isPublished$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    map(movie => movie.app.financiers.status),
    map(status => status === 'accepted' || status === 'submitted')
  );

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private consentsService: ConsentsService,
    private dialog: MatDialog
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit(): void {
    const { missingFields, errorFields } = findInvalidControls(this.form);
    this.invalidFields = errorFields;
    this.missingFields = missingFields;
    this.blockingFields = Array.from(new Set(errorFields.concat(missingFields)));
  }

  public async submit() {
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
            const movieId = this.route.snapshot.paramMap.get('movieId');
            await this.consentsService.createConsent('share', movieId);
            const text = `${this.form.get('title').get('international').value} was successfully submitted.`;
            const ref = this.snackBar.open(text, '', { duration: 4000 });
            ref.afterDismissed().subscribe(() => this.router.navigate(['../end'], { relativeTo: this.route }))
          } catch (_) {
            // Log the invalid forms   
            let message: string;
            if (this.invalidFields.length) {
              message = 'Some fields have invalid information.';
            } else if (this.missingFields.length) {
              message = 'Mandatory information is missing.';
            } else {
              this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
            }
            const section = document.getElementById('main-information');
            const ref = this.snackBar.open(message, 'VERIFY FIELDS', { duration: 5000 });
            ref.afterDismissed().subscribe(() => section.scrollIntoView({ behavior: 'smooth' }));
          }
        }
      }
    });
  }
}
