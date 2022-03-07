import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
// Rxjs
import { shareReplay } from "rxjs/operators";
// Blockframes
import { Movie } from "@blockframes/movie/+state/movie.model";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { App } from "@blockframes/utils/apps";
import { APP } from "@blockframes/utils/routes/utils";

@Component({
  selector: 'festival-titles-analytics',
  templateUrl: './titles-analytics.component.html',
  styleUrls: ['./titles-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesAnalyticsComponent {

  titles$ = this.service.queryDashboard(this.app).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: MovieService,
    @Inject(APP) public app: App
  ) {}

  goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }
}