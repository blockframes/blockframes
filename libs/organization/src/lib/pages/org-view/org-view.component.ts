import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization, OrganizationQuery } from '../../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgViewComponent implements OnInit {
  public org$: Observable<Organization>;

  constructor(
    private query: OrganizationQuery,
  ) {
  }

  ngOnInit() {
    this.org$ = this.query.select('org');
  }

}
