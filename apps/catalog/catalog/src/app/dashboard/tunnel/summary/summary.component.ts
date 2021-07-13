import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component'

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');
  subscription: Subscription;
  missingFields: string[] = [];
  invalidFields: string[] = [];
  isPublished$ = this.query.selectActive(movie => movie.app.catalog.status).pipe(
    map(status => status === 'accepted' || status === 'submitted')
  )

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit(): void {
    this.missingFields = findInvalidControls(this.form).missingFields;
    this.subscription = this.form.valueChanges.subscribe(() => {
      const results = findInvalidControls(this.form);
      this.invalidFields = results.errorFields;
      this.missingFields = results.missingFields;
      console.log('missing', this.missingFields, this.missingFields.length);
      console.log('invalid', this.invalidFields, this.invalidFields.length);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async submit() {
    if (this.form.valid) {
      await this.shell.layout.update({ publishing: true });
      const text = `${this.form.get('title').get('international').value} was successfully submitted.`;
      const ref = this.snackBar.open(text, '', { duration: 1000 });
      ref.afterDismissed().subscribe(() => {
        this.router.navigate(['../', 'end'], { relativeTo: this.route })
      })
    } else {
      // Log the invalid forms
      if (this.invalidFields.length) {
        this.snackBar.open('Errors within the form.', '', { duration: 2000 });
      }
      else if (this.missingFields.length) {
        this.snackBar.open('Mandatory information is missing.', '', { duration: 2000 });
      }
    }
  }

}
