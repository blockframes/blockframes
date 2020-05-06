import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'landing-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingHeaderComponent {
}
