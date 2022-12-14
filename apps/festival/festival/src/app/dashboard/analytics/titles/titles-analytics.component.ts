import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { joinWith } from 'ngfire';
import { firstValueFrom } from 'rxjs';

// Blockframes
import { AggregatedAnalytic, Analytics, createAggregatedAnalytic, Movie, App, Event } from '@blockframes/model';
import { fromOrgAndAccessible, MovieService } from '@blockframes/movie/service';
import { APP } from '@blockframes/utils/routes/utils';
import { EventService } from '@blockframes/event/service';
import { where } from 'firebase/firestore';
import { AnalyticsService } from '@blockframes/analytics/service';
import { OrganizationService } from '@blockframes/organization/service';

interface AggregatedPerTitle extends AggregatedAnalytic {
  screenings: number;
}

function createAggregatedPerTitle(data: Partial<AggregatedPerTitle>): AggregatedPerTitle {
  return {
    screenings: 0,
    ...data,
    ...createAggregatedAnalytic(data),
  }
}

function countAnalytics(title: Movie & { analytics?: Analytics[], events?: Event[] }) {
  const aggregated = createAggregatedPerTitle({
    title,
    screenings: title.events?.length
  });
  if (!title.analytics) return aggregated;
  for (const analytic of title.analytics) {
    aggregated[analytic.name]++;
  }
  return aggregated;
}

@Component({
  selector: 'festival-titles-analytics',
  templateUrl: './titles-analytics.component.html',
  styleUrls: ['./titles-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesAnalyticsComponent {

  titlesAnalytics$ = firstValueFrom(this.service.valueChanges(fromOrgAndAccessible(this.orgService.org.id, this.app)).pipe(
    joinWith({
      analytics: title => this.getTitleAnalytics(title.id),
      events: title => this.eventService.valueChanges([
        where('type', '==', 'screening'),
        where('meta.titleId', '==', title.id),
        where('ownerOrgId', '==', this.orgService.org.id),
      ])
    }, { shouldAwait: true }),
    map(titles => titles.map(countAnalytics))
  ));

  constructor(
    private analytics: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private service: MovieService,
    private eventService: EventService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }

  getTitleAnalytics(titleId: string) {
    return this.analytics.getTitleAnalytics({ titleId }).pipe(
      joinWith({
        org: ({ meta }) => this.orgService.valueChanges(meta.orgId)
      }, { shouldAwait: true }),
      map(analyticsWithOrg => {
        return analyticsWithOrg.filter(({ org }) => !org.appAccess.festival.dashboard);
      })
    );
  }

  goToTitle(data: AggregatedAnalytic) {
    this.router.navigate([data.title.id], { relativeTo: this.route });
  }
}
