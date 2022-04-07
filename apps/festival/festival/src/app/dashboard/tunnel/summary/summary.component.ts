import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { findInvalidControls } from '@blockframes/ui/tunnel/layout/layout.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map, pluck, switchMap } from 'rxjs/operators';
import { MovieService } from '@blockframes/movie/+state/movie.service';

@Component({
  selector: 'festival-summary-tunnel',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelSummaryComponent implements OnInit {
  form = this.shell.getForm('movie');
  // Fields displayed in component that are in error or missing but mandatory
  blockingFields: string[] = [];
  // Missing but mandatory fields
  private missingFields: string[] = [];
  // Fields in error
  private invalidFields: string[] = [];

  isPublished$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    map(movie => movie.app.catalog.status),
    map(status => status === 'accepted' || status === 'submitted')
  );

  constructor(
    private shell: MovieFormShellComponent,
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Summary and Submit a new title')
  }

  ngOnInit() {
    const { missingFields, errorFields } = findInvalidControls(this.form);
    this.invalidFields = errorFields;
    this.missingFields = missingFields;
    this.blockingFields = Array.from(new Set(errorFields.concat(missingFields)));
  }

  public async submit() {
    if (this.form.valid) {
      await this.shell.layout.update({ publishing: true });
      const text = `${this.form.get('title').get('international').value} successfully published.`;
      const ref = this.snackBar.open(text, 'SEE ON MARKETPLACE', { duration: 7000 });
      ref.afterDismissed().subscribe(() => {
        const movieId = this.route.snapshot.paramMap.get('movieId');
        this.router.navigate(['c/o/marketplace/title', movieId]);
      })
    } else {
      // Log the invalid forms
      if (this.invalidFields.length) {
        this.snackBar.open('Some fields have invalid information.', '', { duration: 2000 });
      } else if (this.missingFields.length) {
        this.snackBar.open('Mandatory information is missing.', '', { duration: 2000 });
      }
    }
  }
}
