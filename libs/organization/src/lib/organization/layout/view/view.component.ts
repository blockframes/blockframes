import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, Event } from '@angular/router';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'org-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
  @Input() navLinks;
  @Input() org: Organization;
  @ViewChild('main') main: ElementRef<HTMLDivElement>;
  public navClicked = false;
  private countRouteEvents = 1;
  private sub: Subscription;

  constructor(
    private location: Location,
    private router: Router,
  ) { }

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((evt: Event) => evt instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.historyGo(-this.countRouteEvents);
  }

  scrollIntoView() {
    /* We don't want to trigger the animation when the user just arrived on the page */
    if (this.navClicked) {
      scrollIntoView(this.main.nativeElement);
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
