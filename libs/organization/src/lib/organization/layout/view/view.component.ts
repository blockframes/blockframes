import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { Location } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'org-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  @Input() navLinks;
  @Input() org: Organization;
  @ViewChild('main') main: ElementRef<HTMLDivElement>;
  public navClicked = false;

  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

  scrollIntoView() {
    /* We don't want to trigger the animation when the user just arrived on the page */
    if (this.navClicked) {
      this.main.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
