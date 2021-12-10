import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { fromOrgAndAccepted, Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-screening',
  templateUrl: './screening.component.html',
  styleUrls: ['./screening.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningComponent implements OnInit {

  titles$: Observable<Movie[]>;
  screenerMissing: boolean;
  titleMissing: boolean;
  constructor(
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private shell: EventFormShellComponent,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  get formMeta() {
    return this.shell.form.get('meta');
  }

  get link() {
    return this.shell.link;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id, 'festival'))),
      map(titles => titles.sort((a, b) => a.title.international.localeCompare(b.title.international)))
    );

    this.checkTitleAndScreener(this.shell.form.meta.value.titleId);
  }

  copied() {
    this.snackBar.open('Link copied', 'CLOSE', { duration: 4000 });
  }

  async checkTitleAndScreener(titleId: string) {
    if(!titleId) {
      this.titleMissing = true;
    } else {
      this.titleMissing = false;
      const title = await this.movieService.getValue(titleId);
      this.screenerMissing = !title.promotional.videos?.screener?.jwPlayerId;
    }
    this.cdr.markForCheck();
  }
}
