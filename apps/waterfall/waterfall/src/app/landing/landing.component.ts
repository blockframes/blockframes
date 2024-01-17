import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { applicationUrl } from '@blockframes/utils/apps';

@Component({
  selector: 'waterfall-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent {

  public applicationUrl = applicationUrl;
}
