import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';
import { MovieAnalytics } from '@blockframes/model';
import { Movie } from '@blockframes/model';

export const getViews = (analytics?: MovieAnalytics) => {
  return analytics?.movieViews.current.reduce((sum, event) => sum + event.hits, 0) || 0;
};

@Pipe({ name: 'getTitlesAnalytics' })
export class GetTitlesAnalyticsPipe implements PipeTransform {
  constructor(private analytics: AnalyticsService) {}
  transform(movies: Movie[]): Promise<MovieAnalytics[]> {
    const movieIds = movies.map((m) => m.id);
    return this.analytics.getValue(movieIds).then((value) => value.filter((v) => !!v));
  }
}

@NgModule({
  exports: [GetTitlesAnalyticsPipe],
  declarations: [GetTitlesAnalyticsPipe],
})
export class AnalyticsPipeModule {}
