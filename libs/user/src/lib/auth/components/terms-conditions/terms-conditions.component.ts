import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  public isFestival: boolean;
  constructor(private routerQuery: RouterQuery) {
    this.isFestival = this.routerQuery.getData<string>('app') === 'festival' ? true : false;
  }
}
