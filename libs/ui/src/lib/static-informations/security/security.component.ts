import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';

@Component({
  selector: 'bf-security',
  templateUrl: 'security.component.html',
  styleUrls: ['./security.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityComponent {
  canGoBack = window.history.length > 1;

  public appLang = localStorage.getItem('locale') || navigator.language;// TODO #9699 use auth preferedLanguage ?

  constructor(
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }
}
