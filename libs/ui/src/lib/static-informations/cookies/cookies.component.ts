import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';

@Component({
  selector: 'bf-cookies',
  templateUrl: 'cookies.component.html',
  styleUrls: ['./cookies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookiesComponent {
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }
}
