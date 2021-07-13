import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map } from 'rxjs/operators';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component'

@Component({
  selector: 'catalog-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit {
  form = this.shell.getForm('movie');
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
    const { missingFields, errorFields } = findInvalidControls(this.form)
    this.invalidFields = errorFields;
    this.missingFields = missingFields;
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
