import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { pluck, switchMap } from "rxjs/operators";

@Component({
  selector: 'festival-title-analytics',
  templateUrl: './title-analytics.component.html',
  styleUrls: ['./title-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAnalyticsComponent {

  title$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  constructor(
    private location: Location,
    private movieService: MovieService,
    private route: ActivatedRoute
  ) {}

  goBack() {
    this.location.back();
  }
}