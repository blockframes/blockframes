import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

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
  public routerData$ = this.routerQuery.selectData('animation');

  @Input() routes: RouteDescription[];
  @Input()
  set form(form: MovieForm) {
    this._form.next(form);
  }
  get form(): MovieForm {
    return this._form.getValue();
  }

  constructor(private query: MovieQuery, private routerQuery: RouterQuery, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.query.selectActive().subscribe(movie => {
      this.form = new MovieForm(movie);
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
