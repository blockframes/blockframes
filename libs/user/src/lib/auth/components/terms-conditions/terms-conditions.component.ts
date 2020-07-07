import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from "@angular/common";

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
