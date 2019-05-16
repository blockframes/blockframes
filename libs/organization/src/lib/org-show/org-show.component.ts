import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization, OrganizationQuery } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-show',
  templateUrl: './org-show.component.html',
  styleUrls: ['./org-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgShowComponent implements OnInit {
  public org$: Observable<Organization>;

  constructor(
    private query: OrganizationQuery,
  ) {
  }

  ngOnInit() {
    this.org$ = this.query.selectActive();
  }

}
