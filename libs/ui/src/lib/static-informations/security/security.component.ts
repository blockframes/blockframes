import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';
import { preferredLanguage } from "@blockframes/model";

@Component({
  selector: 'bf-security',
  templateUrl: 'security.component.html',
  styleUrls: ['./security.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityComponent {
  canGoBack = window.history.length > 1;

  public appLang = preferredLanguage();

  constructor(
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }
}
