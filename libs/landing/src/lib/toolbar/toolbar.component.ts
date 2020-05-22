import { Component, ChangeDetectionStrategy,Input } from '@angular/core';

@Component({
  selector: '[imgAsset] landing-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingToolbarComponent {
  @Input() imgAsset = 'LogoArchipelContentPrimary.svg';
  @Input() color = 'default';
}
