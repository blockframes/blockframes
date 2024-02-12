import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Media, PricePerCurrency, Scope, Term, Territory, WaterfallSale, getContractAndAmendments, getLatestContract, getTotalPerCurrency, toLabel } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { rightholderName } from '../../pipes/rightholder-name.pipe';
import { BehaviorSubject } from 'rxjs';

interface SalesData {
  contract: (WaterfallSale & { terms: Term[] });
  territories: Territory[];
  medias: Media[];
  amount: PricePerCurrency;
}

@Component({
  selector: 'waterfall-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesListComponent implements OnInit {
  @Input() private sales: (WaterfallSale & { terms: Term[] })[] = [];
  public sorts = sorts;
  public waterfall = this.shell.waterfall;
  public rows$ = new BehaviorSubject<SalesData[]>([]);

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    const incomes = await this.shell.incomes();
    const rootContracts = this.sales.filter(c => !c.rootId);
    const rows: SalesData[] = [];
    for (const rootContract of rootContracts) {
      const contractAndAmendments = getContractAndAmendments(rootContract.id, this.sales);
      const contract = getLatestContract(contractAndAmendments);
      const contractIncomes = incomes.filter(i => i.status === 'received' && contractAndAmendments.find(c => c.id === i.contractId));
      if (!contractIncomes.some(i => i.price > 0)) continue;
      const row: SalesData = {
        contract,
        territories: unique(contract.terms.map(t => t.territories).flat()),
        medias: unique(contract.terms.map(t => t.medias).flat()),
        amount: getTotalPerCurrency(contractIncomes),
      };
      rows.push(row);
    }
    this.rows$.next(rows);
  }

  public downloadCsv(rows: SalesData[]) {
    const exportedRows = rows.map(r => ({
      'Licensor': rightholderName(r.contract.sellerId, this.shell.waterfall),
      'Licensee': rightholderName(r.contract.buyerId, this.shell.waterfall),
      'Territories': toLabel(r.territories, 'territories'),
      'Medias': toLabel(r.medias, 'medias'),
      'Amount': r.amount.EUR ? `${r.amount.EUR} EUR` : `${r.amount.USD} USD`
    }));

    const filename = `${this.shell.movie.title.international.split(' ').join('_')}_world_sales_summary`;
    downloadCsvFromJson(exportedRows, filename);
  }

  public openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }
}
