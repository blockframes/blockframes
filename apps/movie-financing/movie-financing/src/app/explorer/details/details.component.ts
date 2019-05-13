import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMovie } from '../../canne-data';
import { Observable } from 'rxjs';
import { AuthQuery, User } from '@blockframes/auth';
import { map } from 'rxjs/operators';
import { FinancingMovie } from '../search/search.component';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent implements OnInit, OnDestroy {
  public movie$: Observable<FinancingMovie> = null;
  public user$: Observable<User>;

  constructor(
    private router: ActivatedRoute,
    public query: AuthQuery
  ) {
    this.movie$ = router.params.pipe(
      map(({ id }) => getMovie(id))
    );
    this.user$ = this.query.user$;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public sumItems(items: Array<any>, attr: string) {
    return items.reduce((sum, item) => sum + parseFloat(item[attr]), 0);
  }
}
