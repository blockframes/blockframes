import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTitleShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private _form = new BehaviorSubject<MovieForm>(undefined);

  public form$ = this._form.asObservable();
  public movieId: string;

  @Input() routes: RouteDescription[];
  @Input()
  set form(form: MovieForm) {
    this._form.next(form);
  }
  get form(): MovieForm {
    return this._form.getValue();
  }

  constructor(private query: MovieQuery, private cdr: ChangeDetectorRef, private routerQuery: RouterQuery) {}

  ngOnInit() {
    this.sub = this.query.selectActive().subscribe(movie => {
      this.form = new MovieForm(movie);
      this.cdr.markForCheck();
    })
    this.movieId = this.routerQuery.getParams('movieId');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  get runningTime() {
    const time = this.form.runningTime.get('time').value;
    return time === 'TBC' || null ? 'TBC' : time + ' min';
  }

  get directors() {
    return this.form.directors.controls.map(director => `${director.get('firstName').value}  ${director.get('lastName').value}`).join(', ');
  }
}
