import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@sentry/browser';
import { AuthService } from '@blockframes/auth';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  public userId = '';
  public user: User;
  public isUserBlockframesAdmin = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.user = await this.authService.getUser(this.userId);
    this.isUserBlockframesAdmin = await this.authService.isBlockframesAdmin(this.userId);
    this.cdRef.markForCheck();
  }

  public async setBlockframesAdmin() {
    this.isUserBlockframesAdmin = !this.isUserBlockframesAdmin;
    await this.authService.setBlockframesAdmin(this.isUserBlockframesAdmin, this.userId);
    this.cdRef.markForCheck();
  }

  public getOrgEditPath(orgId: string) {
    return `/c/o/organization/${orgId}/view/org`;
  }
}
