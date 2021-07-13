import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { AnalyticsService } from "@blockframes/utils/analytics/analytics.service";
import { map } from "rxjs/operators";
import { MovieAnalytics } from "../+state/movie.firestore";
import { Movie } from '@blockframes/movie/+state/movie.model';

export const getViews = (analytics?: MovieAnalytics) => {
  return analytics?.movieViews.current.reduce((sum, event) => sum + event.hits, 0) || 0;
}

@Pipe({ name: 'getViews' })
export class GetViewsPipe implements PipeTransform {
  constructor(private analytics: AnalyticsService) {}
  transform(id: string): Observable<number> {
    return this.analytics.valueChanges(id).pipe(
      map(getViews)
    );
  }
}

@Pipe({ name: 'getTitlesAnalytics' })
export class GetTitlesAnalyticsPipe implements PipeTransform {
  constructor(private analytics: AnalyticsService) {}
  transform(movies: Movie[]): Promise<MovieAnalytics[]> {
    const movieIds = movies.map(m => m.id);
    return this.analytics.getValue(movieIds).then(value => value.filter(v => !!v));
  }
}

@NgModule({
  exports: [GetViewsPipe, GetTitlesAnalyticsPipe],
  declarations: [GetViewsPipe, GetTitlesAnalyticsPipe],
})
export class AnalyticsPipeModule {}