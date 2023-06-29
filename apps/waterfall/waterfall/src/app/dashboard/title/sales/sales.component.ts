import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import {
  filterContractsByTitle,
  Contract,
  Term,
  Movie,
  isSale,
  territoriesSold,
  TerritorySoldMarker,
  isMandate,
  ContractType,
  Media,
  Territory,
  Organization,
  externalOrgIdentifier,
  getTermDurationStatus,
  Income,
  getTotalIncome,
  getDeclaredAmount,
  getLatestContract,
  getCurrentContract,
  getContractAndAmendments
} from '@blockframes/model';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { TermService } from '@blockframes/contract/term/service';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { OrganizationService } from '@blockframes/organization/service';
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { IncomeService } from '@blockframes/contract/income/service';
import { where } from 'firebase/firestore';

function getDateDifference(a: Date, b: Date) {
  const yearDiff = differenceInYears(a, b);
  if (yearDiff > 0) return { value: yearDiff, label: yearDiff === 1 ? 'year' : 'years' };
  const monthDiff = differenceInMonths(a, b);
  if (monthDiff > 0) return { value: monthDiff, label: monthDiff === 1 ? 'month' : 'months' };
  const dayDiff = differenceInDays(a, b);
  if (dayDiff > 0) return { value: dayDiff, label: dayDiff === 1 ? 'day' : 'days' };
}

@Component({
  selector: 'waterfall-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {

  private contracts$ = this.shell.movie$.pipe(
    switchMap((movie: Movie) => this.waterfallDocumentsService.titleContracts(movie.id))
  );
  private waterfallId: string;
  private mandates$ = this.contracts$.pipe(map((contracts) => contracts.filter(isMandate)));
  private mandateTerms$ = this.getTerms(this.mandates$);
  private sales$ = this.contracts$.pipe(map((contracts) => contracts.filter(isSale)));
  private salesTerms$ = this.getTerms(this.sales$);

  public hoveredTerritory: {
    name: string;
    data?: {
      orgName: string;
      termStatus: string;
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

  public territoriesSold$ = combineLatest([
    this.shell.movie$,
    this.sales$,
    this.salesTerms$,
    this.mandates$,
    this.mandateTerms$
  ]).pipe(
    map(([movie, sales, salesTerms, mandates, mandateTerms]) => {
      this.waterfallId = movie.id;
      const res = filterContractsByTitle(movie.id, mandates, mandateTerms, sales, salesTerms);
      return territoriesSold([...res.mandates, ...res.sales]);
    }),
    tap(async markers => {
      const allMarkers = Object.values(markers).flat();
      const orgIds = Array.from(new Set(allMarkers.map(t => t.contracts?.filter(s => s.buyerId).map(s => s.buyerId)).flat().filter(o => !!o)));
      if (orgIds.length) this.orgsCache = await this.orgService.getValue(orgIds);

      this.incomesCache = await this.incomeService.getValue([where('titleId', '==', this.waterfallId)]);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private orgsCache: Organization[] = [];
  private incomesCache: Income[] = [];

  constructor(
    private termsService: TermService,
    private waterfallDocumentsService: WaterfallDocumentsService,
    private orgService: OrganizationService,
    private incomeService: IncomeService,
    private shell: DashboardTitleShellComponent,
  ) { }

  private getTerms(contracts$: Observable<Contract[]>) {
    return contracts$.pipe(
      switchMap((contract) => {
        const list = contract.flatMap((movie) => movie.termIds);
        if (list.length === 0) return of([]) as Observable<Term[]>;
        return this.termsService.valueChanges(list);
      })
    );
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritorySoldMarker) {
    const [firstContract] = (territory.contracts || []);
    if (firstContract) {
      const contractAndAmendments = getContractAndAmendments(firstContract.id, territory.contracts);
      const contract = getCurrentContract(contractAndAmendments);

      const org = this.orgsCache.find(o => contract.buyerId === o.id);
      const orgName = org?.name || externalOrgIdentifier;

      const termsStatus = contract.terms.map(t => ({ duration: t.duration, status: getTermDurationStatus(t) }));

      let termStatus = '';
      const onGoingTerm = termsStatus.find(t => t.status === 'ongoing');
      const endedTerm = termsStatus.find(t => t.status === 'past');
      const notStartedTerm = termsStatus.find(t => t.status === 'future');
      const now = new Date();
      if (onGoingTerm) {
        const infos = getDateDifference(onGoingTerm.duration.to, now);
        termStatus = `Contract expires in ${infos.value} ${infos.label}`;
      } else if (endedTerm) {
        const infos = getDateDifference(now, endedTerm.duration.to);
        termStatus = `Contract expired ${infos.value} ${infos.label} ago`;
      } else {
        const infos = getDateDifference(notStartedTerm.duration.from, now);
        termStatus = `Contract begins in ${infos.value} ${infos.label}`;
      }

      this.hoveredTerritory = { name: territory.label, data: { orgName, termStatus } };
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
      const orgIds = Array.from(new Set(territory.contracts.filter(s => s.buyerId).map(s => s.buyerId)));
      const orgs = this.orgsCache.filter(o => orgIds.includes(o.id));
      const infos = [];

      const rootContracts = territory.contracts.filter(c => !c.rootId);
      for (const rootContract of rootContracts) {

        const contractAndAmendments = getContractAndAmendments(rootContract.id, territory.contracts);
        const contract = getLatestContract(contractAndAmendments);
        const childContracts = contractAndAmendments.filter(c => c.rootId);
        const incomes = this.incomesCache.filter(i => contractAndAmendments.find(c => c.id === i.contractId));
        
        const contractInfos = {
          buyerName: contract.buyerId ? orgs.find(o => o.id === contract.buyerId).name : externalOrgIdentifier,
          type: contract.type,
          signatureDate: contract.signatureDate,
          duration: contract.duration,
          medias: Array.from(new Set(contract.terms.map(t => t.medias).flat())),
          territories: Array.from(new Set(contract.terms.map(t => t.territories).flat())),
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
