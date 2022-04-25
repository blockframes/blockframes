import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';

@Component({
  selector: 'bf-privacy',
  templateUrl: 'privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent {
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }
}
