import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { AuthQuery } from "@blockframes/auth";
import { Router } from "@angular/router";

@Component({
  selector: 'organization-loading',
  templateUrl: './organization-loading.component.html',
  styleUrls: ['./organization-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLoadingComponent implements OnInit {

  constructor(
    private router: Router,
    private query: AuthQuery,
  ) {}

  ngOnInit() {
    this.query.user$.subscribe(user => {
      if (!!user.orgId) {
        this.router.navigateByUrl('/');
      }
    });
  }
}
