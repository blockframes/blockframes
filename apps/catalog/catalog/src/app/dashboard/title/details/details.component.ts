import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
import { MovieForm } from '@blockframes/movie/movieform/movie.form';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'catalog-title-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleDetailsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public form = new MovieForm();

  constructor(
    private route: ActivatedRoute,
    private movieQuery: MovieQuery,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.movieQuery.selectActive().subscribe(movie => {
      this.form.patchValue(movie);
      this.cdr.markForCheck();
    });
  }

  public getPath(segment: string) {
    const movieId = this.route.snapshot.params.movieId;
    return `/c/o/dashboard/movie-tunnel/${movieId}/${segment}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
