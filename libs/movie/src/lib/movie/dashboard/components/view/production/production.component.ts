// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { Subscription } from 'rxjs/internal/Subscription';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewProductionComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  public form = this.shell.form;

  constructor(
    private movieQuery: MovieQuery,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Production Information');
    this.subscription = this.movieQuery.selectActive().subscribe(movie => {
      this.form = new MovieForm(movie);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
