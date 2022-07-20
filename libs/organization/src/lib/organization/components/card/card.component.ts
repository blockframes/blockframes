import { Component, Input, ChangeDetectionStrategy, Inject } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { Organization, App } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs';
import { APP } from '@blockframes/utils/routes/utils';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent {

  private _org: Organization;
  get org() {
    return this._org;
  }
  @Input() set org(value: Organization) {
    this._org = value;

    Promise.all([
      this.movieService.load(fromOrgAndAccepted(this.org.id, this.app)),
      this.orgService.getMembers(this.org, { removeConcierges: true })
    ]).then(([movies, members]) => {
      this.orgMovieCount$.next(movies.length);
      this.memberCount$.next(members.length);
    });
  }

  @Input() @boolean hideTabs = false;

  public orgMovieCount$ = new BehaviorSubject<number>(0);
  public memberCount$ = new BehaviorSubject<number>(0);

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }
}
