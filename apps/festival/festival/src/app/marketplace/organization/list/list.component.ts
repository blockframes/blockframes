import { Component, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { centralOrgID } from '@env';
import { Movie } from '@blockframes/movie/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  @HostBinding('@scaleOut') animation = true;
  orgs$: Observable<Organization[]>;
  public movies: Movie[] = [];

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'All');
    this.orgs$ = this.service
      .valueChanges(ref => ref
        .where('appAccess.festival.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && org.movieIds.length)));
  }
}
