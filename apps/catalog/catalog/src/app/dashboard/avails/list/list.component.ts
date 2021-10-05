import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { ContractService } from "@blockframes/contract/contract/+state";
import { IncomeService } from "@blockframes/contract/income/+state";
import { MovieService } from "@blockframes/movie/+state";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { DynamicTitleService } from "@blockframes/utils/dynamic-title/dynamic-title.service";
import { joinWith } from "@blockframes/utils/operators";
import { MovieCurrency } from "@blockframes/utils/static-model";
import { map, pluck, tap } from "rxjs/operators";

@Component({
  selector: 'catalog-avails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsListComponent implements OnInit {
  public availsForm = new AvailsForm({ territories: [] }, ['territories']);
  public orgId = this.orgQuery.getActiveId();

  public query$ = this.titleService.valueChanges(ref => ref.where('orgIds', 'array-contains', this.orgId)).pipe(
    joinWith({
      sales: title => this.contractService.valueChanges(ref => ref.where('titleId', '==', title.id).where('type', '==', 'sale')).pipe(
        joinWith({
          income: sale => this.incomeService.valueChanges(sale.id)
        })
      ),
      totalIncome: () => ({ euro: 0, dollar: 0 }), // used for typings
    }, { debounceTime: 200 }),
    map(titles => titles.map(title => {
      const initialTotal = { euro: 0, dollar: 0 };
      title.totalIncome = title.sales?.reduce((total, sale) => {
        if (sale.income.currency === 'USD') {
          total.dollar += sale.income.price
        } else {
          total.euro += sale.income.price
        }
        return total;
      }, initialTotal) ?? initialTotal;
      return title;
    })
    )
  ).pipe(
    tap(values => console.log({ values }))
  );

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private orgQuery: OrganizationQuery,
  ) { }

  ngOnInit() {
    console.log('hello world')
  }
}
