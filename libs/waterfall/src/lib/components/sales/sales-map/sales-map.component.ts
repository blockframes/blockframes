import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  filterContractsByTitle,
  territoriesSold,
  TerritorySoldMarker,
  ContractType,
  Media,
  Territory,
  getTotalPerCurrency,
  getDeclaredAmount,
  getLatestContract,
  getCurrentContract,
  getContractAndAmendments,
  WaterfallContract,
  getContractDurationStatus,
  Waterfall,
  Term,
  Income,
  WaterfallSale
} from '@blockframes/model';
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { unique } from '@blockframes/utils/helpers';

function getDateDifference(a: Date, b: Date) {
  const yearDiff = differenceInYears(a, b);
  if (yearDiff > 0) return { value: yearDiff, label: yearDiff === 1 ? $localize`year` : $localize`years` };
  const monthDiff = differenceInMonths(a, b);
  if (monthDiff > 0) return { value: monthDiff, label: monthDiff === 1 ? $localize`month` : $localize`months` };
  const dayDiff = differenceInDays(a, b);
  if (dayDiff > 0) return { value: dayDiff, label: dayDiff === 1 ? $localize`day` : $localize`days` };
}

export interface SalesMapData {
  sales: WaterfallSale[];
  waterfall: Waterfall;
  terms: Term[];
  incomes: Income[];
}

@Component({
  selector: 'waterfall-sales-map',
  templateUrl: './sales-map.component.html',
  styleUrls: ['./sales-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesMapComponent implements OnInit {

  @Input() data: SalesMapData;

  public hoveredTerritory: {
    name: string;
    data?: {
      rightholderName: string;
      contractStatus: string;
    };
  }

  public clickedTerritory: {
    name: string;
    infos: {
      buyerName: string,
      type: ContractType,
      duration: Duration,
      medias: Media[];
      territories: Territory[];
    }[]
  }

  public territoriesSold: Record<string, TerritorySoldMarker[]>;
  public empty: boolean;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    const sales = this.data.sales;
    const salesTerms = this.getTerms(sales);

    const res = filterContractsByTitle(this.data.waterfall.id, [], [], sales, salesTerms);
    this.territoriesSold = territoriesSold([...res.sales.filter(s => s.terms)]);
    this.empty = false;
    if (this.territoriesSold.all.length === 0 && this.territoriesSold.tv.length === 0 && this.territoriesSold.vod.length === 0 && this.territoriesSold.other.length === 0) {
      this.empty = true;
    }
    this.cdr.markForCheck();
  }

  private getTerms(contracts: WaterfallContract[]) {
    const termIds = unique(contracts.map(c => c.termIds).flat());
    return this.data.terms.filter(t => termIds.includes(t.id));
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritorySoldMarker) {
    const [firstContract] = (territory.contracts || []);
    if (firstContract) {
      const contractAndAmendments = getContractAndAmendments(firstContract.id, territory.contracts);
      const contract = getCurrentContract(contractAndAmendments);

      const rightholderName = this.data.waterfall.rightholders.find(r => r.id === contract.buyerId).name;

      const durationStatus = getContractDurationStatus(contract);

      const now = new Date();
      let contractStatus = '';
      switch (durationStatus) {
        case 'ongoing': {
          const infos = getDateDifference(contract.duration.to, now);
          contractStatus = $localize`Contract expires in ${infos.value} ${infos.label}`;
          break;
        }
        case 'past': {
          const infos = getDateDifference(now, contract.duration.to);
          contractStatus = $localize`Contract expired ${infos.value} ${infos.label} ago`;
          break;
        }
        case 'future': {
          const infos = getDateDifference(contract.duration.from, now);
          contractStatus = $localize`Contract begins in ${infos.value} ${infos.label}`;
          break;
        }
      }

      this.hoveredTerritory = { name: territory.label, data: { rightholderName, contractStatus } };
    } else {
      this.hoveredTerritory = { name: territory.label };
    }

  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  public showDetails(territory: TerritorySoldMarker) {
    if (this.clickedTerritory?.name === territory.label) this.clickedTerritory = null;
    else {
      const infos = [];

      const rootContracts = territory.contracts.filter(c => !c.rootId);
      for (const rootContract of rootContracts) {

        const contractAndAmendments = getContractAndAmendments(rootContract.id, territory.contracts);
        const contract = getLatestContract(contractAndAmendments);
        const childContracts = contractAndAmendments.filter(c => c.rootId);
        const incomes = this.data.incomes.filter(i => i.status === 'received' && contractAndAmendments.find(c => c.id === i.contractId));

        const contractInfos = {
          buyerName: this.data.waterfall.rightholders.find(r => r.id === contract.buyerId).name,
          type: contract.type,
          signatureDate: contract.signatureDate,
          duration: contract.duration,
          medias: unique(contract.terms.map(t => t.medias).flat()),
          territories: unique(contract.terms.map(t => t.territories).flat()),
          declaredAmount: getDeclaredAmount(contract),
          totalIncome: getTotalPerCurrency(incomes),
          rootContract: rootContract.id,
          childContracts: childContracts.map(c => c.id)
        };

        infos.push(contractInfos);
      }
      this.clickedTerritory = { name: territory.label, infos };
    }
  }

  public closeDetails() {
    this.clickedTerritory = null;
  }
}
