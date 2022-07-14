import { Component, Input, ChangeDetectionStrategy, Inject, ChangeDetectorRef } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { Organization, App } from '@blockframes/model';
import { firstValueFrom } from 'rxjs';
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
export class OrganizationCardComponent {

  private _org: Organization;
  get org() {
    return this._org;
  }
  @Input() set org(value: Organization) {
    this._org = value;

    const movies$ = this.movieService.valueChanges(fromOrgAndAccepted(this.org.id, this.app)).pipe(
      map(movies =>
        movies.filter(movie => movie.app[this.app].access)
      ))
    
    Promise.all([
      firstValueFrom(movies$),
      this.orgService.getMembers(this.org, { removeConcierges: true })
    ]).then(res => {
      this.orgMovieCount = res[0].length;
      this.memberCount = res[1].length;
      this.cdr.markForCheck();
    })
  }

  @Input() @boolean hideTabs = false;

  public orgMovieCount: number;
  public memberCount: number;

  constructor(
    private cdr: ChangeDetectorRef,
    private movieService: MovieService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }
}
