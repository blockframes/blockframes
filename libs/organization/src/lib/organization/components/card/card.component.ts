import { Component, Input, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { Organization, App } from '@blockframes/model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;
  @Input() @boolean hideTabs = false;

  public orgMovieCount$: Observable<number>;
  public memberCount = 0;

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }

  async ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrgAndAccepted(this.org.id, this.app)).pipe(
      map(movies =>
        movies.filter(movie => movie.app[this.app].access).length
      )
    );

    const members = await this.orgService.getMembers(this.org, { removeConcierges: true });
    this.memberCount = members.length;
  }
}
