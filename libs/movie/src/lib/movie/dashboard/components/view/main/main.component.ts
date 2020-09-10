// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { Subscription } from 'rxjs/internal/Subscription';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-view-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewMainComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  public form: MovieForm;

  constructor(
    private route: ActivatedRoute,
    private movieQuery: MovieQuery,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Main Information');
    this.subscription = this.movieQuery.selectActive().subscribe(movie => {
      this.form = new MovieForm(movie);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }
}
