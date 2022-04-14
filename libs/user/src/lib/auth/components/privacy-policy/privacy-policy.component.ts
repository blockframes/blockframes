import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }
}
