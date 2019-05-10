import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getMovie } from '../../canne-data';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent implements OnInit, OnDestroy {
  public movie: any;
  private sub: any;

  constructor(
    private router: ActivatedRoute
  ) {
    this.sub = router.params.subscribe(params => {
      this.movie = getMovie(params['id']);
    });
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
