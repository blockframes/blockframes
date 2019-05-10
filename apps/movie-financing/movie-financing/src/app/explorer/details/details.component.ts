import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMovie } from '../../canne-data';
import { Observable } from 'rxjs';
import { AuthQuery, User } from '@blockframes/auth';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent implements OnInit, OnDestroy {
  public movie: any = null;
  public user$: Observable<User>;
  private sub: any;

  constructor(
    private router: ActivatedRoute,
    public query: AuthQuery
  ) {
    this.sub = router.params.subscribe(params => {
      this.movie = getMovie(params['id']);
    });
    this.user$ = this.query.user$;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public sumItems(items: Array<any>, attr: string) {
    let sum = 0;
    items.forEach((item: any) => {
      sum += parseFloat(item[attr]);
    });
    return sum;
  }
}
