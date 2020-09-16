import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
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

  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
