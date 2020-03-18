import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { PLACEHOLDER_LOGO } from '@blockframes/organization';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'dashboard-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {

  public placeholderUrl = PLACEHOLDER_LOGO;
  public contract$ = this.query.selectActive();
  public version$ = this.query.activeVersion$;
  public versionView$ = this.query.activeVersionView$;
  public licensees = this.query.getActiveParties('licensee');

  // Only get contract movies that appears in user organization
  public moviesCount$ = this.movieQuery.selectCount();

  constructor(private query: ContractQuery, private movieQuery: MovieQuery) { }

}
