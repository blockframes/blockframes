import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMovie } from '../../canne-data';
import { Observable } from 'rxjs';
import { AuthQuery, User } from '@blockframes/auth';
import { map, tap } from 'rxjs/operators';
import { FinancingMovie } from '../search/search.component';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent {
  public movie$: Observable<FinancingMovie> = null;
  public user$: Observable<User>;
  public isBalanceLoading$: Observable<boolean>;
  public rank: string;

  constructor(
    private router: ActivatedRoute,
    public query: AuthQuery
  ) {
    this.movie$ = this.router.params.pipe(
      map(({ id }) => getMovie(id)),
      tap(movie => this.rank = movie.minRankRequired)
    );

    this.user$ = this.query.user$;
  }

  public sumItems(items: Array<any>, attr: string) {
    return items.reduce((sum, item) => sum + parseFloat(item[attr]), 0);
  }

  public get userRank(): string {
    const hasRank = !!this.query.user.financing && !!this.query.user.financing.rank;
    return hasRank ? this.query.user.financing.rank : 'silver';
  }

  public get isUserEnoughRanked() {
    if (this.rank === 'platinium' && this.userRank === 'platinium') {
      return true;
    } else if (this.rank === 'gold' && (this.userRank === 'gold' || this.userRank === 'platinium')) {
      return true;
    } else if (this.rank === 'silver') {
      return true;
    } else {
      return false;
    }
  }
}
