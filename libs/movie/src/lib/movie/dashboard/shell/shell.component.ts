import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { combineLatest, Subscription } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { ShellConfig, FORMS_CONFIG } from '../../form/shell/shell.component';
import { MovieQuery } from '@blockframes/movie/+state';

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTitleShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  movie$ = this.query.selectActive();

  @Input() routes: RouteDescription[];

  constructor(
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private query: MovieQuery,
  ) {}

  ngOnInit() {
    const obs = Object.keys(this.configs).map(name => this.configs[name].onInit()).flat();
    this.sub = combineLatest(obs).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name].form;
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
