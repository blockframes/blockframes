import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '@blockframes/auth/service';

@Component({
  selector: 'festival-marketplace-organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
  // Cannot use Guard Active + selectActive as the active organization is the one from the user
  org$ = this.route.params.pipe(
    pluck('orgId'),
    switchMap((orgId: string) => this.service.getValue(orgId))
  );

  navLinks = [{
    path: 'title',
    label: 'Line-up'
  }, {
    path: 'member',
    label: 'Contact'
  }, {
    path: `/c/o/marketplace/organization/${this.route.snapshot.params.orgId}/screening`,
    label: 'Screening Schedule'
  }];

  public isAnonymous: boolean;

  constructor(
    private service: OrganizationService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.isAnonymous = await this.authService.isSignedInAnonymously();
  }

}
