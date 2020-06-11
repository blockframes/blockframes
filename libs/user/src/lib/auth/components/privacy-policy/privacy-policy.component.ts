import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {
  public isFestival: boolean;
  constructor(private routerQuery: RouterQuery) {
    this.isFestival = this.routerQuery.getData<string>('app') === 'festival' ? true : false;
  }
}
