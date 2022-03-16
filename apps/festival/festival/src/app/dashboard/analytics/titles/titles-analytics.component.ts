import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs/operators";
// Blockframes
import { AggregatedAnalytic, createAggregatedAnalytic } from "@blockframes/model";
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

  titlesAnalytics$ = this.service.queryDashboard(this.app).pipe(
    map(titles => titles.map(title => {
      const aggregated = createAggregatedAnalytic({ title });
      if (!title.analytics) return aggregated;
      for (const analytic of title.analytics) {
        aggregated[analytic.name]++;
      }
      return aggregated;
    }))
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: MovieService,
    @Inject(APP) public app: App
  ) {}

  goToTitle(data: AggregatedAnalytic) {
    this.router.navigate([data.title.id], { relativeTo: this.route });
  }
}