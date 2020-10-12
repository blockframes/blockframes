import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { MovieAnalytics, MovieQuery } from "../+state";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Pipe({ name: 'getViews' })
export class GetViewsPipe implements PipeTransform {
  constructor(private query: MovieQuery) {}
  transform(movieId: string): Observable<number> {
    const getViews = (analytics?: MovieAnalytics) => {
      return analytics?.movieViews.current.reduce((sum, event) => sum + event.hits, 0) || 0;
    }
    return this.query.analytics.selectEntity(movieId).pipe(
      map(getViews)
    );
  }
}

@NgModule({
  exports: [GetViewsPipe],
  declarations: [GetViewsPipe],
})
export class AnalyticsPipeModule {}