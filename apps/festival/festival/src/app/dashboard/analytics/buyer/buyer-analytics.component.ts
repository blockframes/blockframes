import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OrganizationService } from "@blockframes/organization/+state";
import { NavigationService } from "@blockframes/ui/navigation.service";
import { UserService } from "@blockframes/user/+state";
import { joinWith } from "@blockframes/utils/operators";
import { pluck, switchMap } from "rxjs";

@Component({
  selector: 'festival-buyer-analytics',
  templateUrl: './buyer-analytics.component.html',
  styleUrls: ['./buyer-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyerAnalyticsComponent {

  userId$ = this.route.params.pipe(
    pluck('userId')
  );

  user$ = this.userId$.pipe(
    switchMap((userId: string) => this.userService.valueChanges(userId)),
    joinWith({
      org: user => this.orgService.valueChanges(user.orgId)
    }, { shouldAwait: true })
  );

  constructor(
    private navService: NavigationService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  goBack() {
    this.navService.goBack(1);
  }
}