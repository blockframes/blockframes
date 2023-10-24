import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  filterContractsByTitle,
  territoriesSold,
  TerritorySoldMarker,
  ContractType,
  Media,
  Territory,
  getTotalIncome,
  getDeclaredAmount,
  getLatestContract,
  getCurrentContract,
  getContractAndAmendments,
  WaterfallContract,
  getContractDurationStatus,
  isWaterfallMandate,
  isWaterfallSale,
  Waterfall,
  Term,
  Income
} from '@blockframes/model';
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { unique } from '@blockframes/utils/helpers';

function getDateDifference(a: Date, b: Date) {
  const yearDiff = differenceInYears(a, b);
  if (yearDiff > 0) return { value: yearDiff, label: yearDiff === 1 ? 'year' : 'years' };
  const monthDiff = differenceInMonths(a, b);
  if (monthDiff > 0) return { value: monthDiff, label: monthDiff === 1 ? 'month' : 'months' };
  const dayDiff = differenceInDays(a, b);
  if (dayDiff > 0) return { value: dayDiff, label: dayDiff === 1 ? 'day' : 'days' };
}

export interface SalesMapData {
  contracts: WaterfallContract[];
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

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    const mandates = this.data.contracts.filter(isWaterfallMandate);
    const mandateTerms = this.getTerms(mandates);
    const sales = this.data.contracts.filter(isWaterfallSale);
    const salesTerms = this.getTerms(sales);

    const res = filterContractsByTitle(this.data.waterfall.id, mandates, mandateTerms, sales, salesTerms);
    this.territoriesSold = territoriesSold([...res.mandates, ...res.sales]);
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
          contractStatus = `Contract expires in ${infos.value} ${infos.label}`;
          break;
        }
        case 'past': {
          const infos = getDateDifference(now, contract.duration.to);
          contractStatus = `Contract expired ${infos.value} ${infos.label} ago`;
          break;
        }
        case 'future': {
          const infos = getDateDifference(contract.duration.from, now);
          contractStatus = `Contract begins in ${infos.value} ${infos.label}`;
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
        const incomes = this.data.incomes.filter(i => contractAndAmendments.find(c => c.id === i.contractId));

        const contractInfos = {
          buyerName: this.data.waterfall.rightholders.find(r => r.id === contract.buyerId).name,
          type: contract.type,
          signatureDate: contract.signatureDate,
          duration: contract.duration,
          medias: unique(contract.terms.map(t => t.medias).flat()),
          territories: unique(contract.terms.map(t => t.territories).flat()),
          declaredAmount: getDeclaredAmount(contract),
          totalIncome: getTotalIncome(incomes),
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
