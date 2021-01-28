import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { AnalyticsService } from "@blockframes/utils/analytics/analytics.service";
import { map } from "rxjs/operators";
import { MovieAnalytics } from "../+state/movie.firestore";

@Pipe({ name: 'getViews' })
export class GetViewsPipe implements PipeTransform {
  constructor(private analytics: AnalyticsService) {}
  transform(id: string): Observable<number> {
    const getViews = (analytics?: MovieAnalytics) => {
      return analytics?.movieViews.current.reduce((sum, event) => sum + event.hits, 0) || 0;
    }
    return this.analytics.valueChanges(id).pipe(
      map(getViews)
    );
  }
}

@NgModule({
  exports: [GetViewsPipe],
  declarations: [GetViewsPipe],
})
export class AnalyticsPipeModule {}