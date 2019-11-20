import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TermsConditionsComponent {

  constructor() {}
}
