import {
  Component, ChangeDetectionStrategy, Input
} from '@angular/core';
import { Contract, Sale } from '@blockframes/model';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface ExternalSale extends Sale {
  licensor: string;
  licensee: string;
  title: string;
}

@Component({
  selector: 'external-sales-list',
  templateUrl: './external-sales.component.html',
  styleUrls: ['./external-sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalSaleListComponent {

  private _sales = new BehaviorSubject<ExternalSale[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  @Input() set sales(sale: ExternalSale[]) {
    this._sales.next(sale);
  }

  get sales() {
    return this._sales.value;
  }

  goToContract({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }
}
