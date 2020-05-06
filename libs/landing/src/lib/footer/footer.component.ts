import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
@Component({
  selector: 'landing-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingFooterComponent {
  @Input() logo = 'LogoAC.svg';
}
