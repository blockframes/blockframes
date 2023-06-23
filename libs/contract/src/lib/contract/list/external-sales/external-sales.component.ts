import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Contract, DetailedContract, getTotalIncome } from '@blockframes/model';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'external-sales-list',
  templateUrl: './external-sales.component.html',
  styleUrls: ['./external-sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalSaleListComponent {

  private _sales = new BehaviorSubject<DetailedContract[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  @Input() set sales(sales: DetailedContract[]) {
    this._sales.next(sales.map(s => ({ ...s, totalIncome: getTotalIncome(s.incomes) })));
  }

  get sales() {
    return this._sales.value;
  }

  goToContract({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }
}
