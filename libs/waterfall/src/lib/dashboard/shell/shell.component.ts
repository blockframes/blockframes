import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  Directive,
  Inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event, ActivatedRoute } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, Subscription } from 'rxjs';
import {
  Action,
  App,
  Block,
  RouteDescription,
  Term,
  Waterfall,
  WaterfallContract,
  convertDocumentTo,
  isContract,
  Version,
  Movie,
  sortContracts,
  Expense,
  Income,
  getDefaultVersionId,
  isDefaultVersion,
  waterfallSources,
  isStandaloneVersion,
  skipGroups,
  getOutgoingStatementPrerequists,
  filterRightholderStatements,
  WaterfallRightholder,
  isBudget,
  WaterfallBudget,
  isFinancingPlan,
  WaterfallFinancingPlan,
  getRightsToDisplay,
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { filter, map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { WaterfallData, WaterfallService, WaterfallState } from '../../waterfall.service';
import { WaterfallDocumentsService } from '../../documents.service';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';
import { RightService } from '../../right.service';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { StatementService } from '../../statement.service';
import { BlockService } from '../../block.service';
import { unique } from '@blockframes/utils/helpers';
import { APP } from '@blockframes/utils/routes/utils';
import { WaterfallPermissionsService } from '../../permissions.service';
import { AuthService } from '@blockframes/auth/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { AmortizationService } from '../../amortization.service';

@Directive({ selector: 'waterfall-cta, [waterfallCta]' })
export class WaterfallCtaDirective { }

@Component({
  selector: 'waterfall-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWaterfallShellComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private countRouteEvents = 1;
  public versionId$ = new BehaviorSubject<string>(undefined);
  private date$ = new BehaviorSubject<Date>(undefined);
  private _date = new Date();
  public isRefreshing$ = new BehaviorSubject<boolean>(false);

  private movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)),
    tap(movie => this.movie = movie)
  );
  public movie: Movie;

  // ---------
  // Rules & Identity checks
  // ---------
  public permissions$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.permissionService.valueChanges({ waterfallId }))
  );

  private permission$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.permissionService.valueChanges(this.authService.profile.orgId, { waterfallId })),
  );

  private isWaterfallAdmin$ = this.permission$.pipe(
    map(permission => permission?.isAdmin)
  );

  /**
   * Check if user is blockframes admin or waterfall admin.
   * This is used when creating or refreshing waterfall.
   */
  public canBypassRules$ = combineLatest([this.isWaterfallAdmin$, this.authService.isBlockframesAdmin$]).pipe(
    map(([isWaterfallAdmin, isBlockframesAdmin]) => isWaterfallAdmin || isBlockframesAdmin),
    tap(canBypassRules => this.canBypassRules = canBypassRules),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  public canBypassRules = false;

  // ---------
  // Contracts, Terms and Documents
  // ---------
  public documents$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.waterfallDocumentService.valueChanges({ waterfallId }))
  );

  public contracts$ = this.documents$.pipe(
    map(documents => documents.filter(d => isContract(d))),
    map(documents => sortContracts(documents.map(d => convertDocumentTo<WaterfallContract>(d)))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public terms$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.termService.valueChanges([where('titleId', '==', waterfallId)]))
  );

  public contractsAndTerms$: Observable<(WaterfallContract & { terms: Term[] })[]> = combineLatest([this.contracts$, this.terms$]).pipe(
    map(([contracts, terms]) => contracts.map(contract => ({
      ...contract,
      terms: terms.filter(term => term.contractId === contract.id)
    })))
  );

  public budgets$ = this.documents$.pipe(
    map(documents => documents.filter(d => isBudget(d))),
    map(documents => documents.map(d => convertDocumentTo<WaterfallBudget>(d))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public financingPlans$ = this.documents$.pipe(
    map(documents => documents.filter(d => isFinancingPlan(d))),
    map(documents => documents.map(d => convertDocumentTo<WaterfallFinancingPlan>(d))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ---------
  // Waterfall, Sources, Righholders, Blocks, Rights, Statements, Incomes, Expenses and State
  // ---------
  public waterfall$ = this.movie$.pipe(
    switchMap(movie => this.waterfallService.valueChanges(movie.id)),
    tap(waterfall => this.waterfall = waterfall),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  public waterfall: Waterfall;

  public sources$ = combineLatest([this.waterfall$, this.versionId$]).pipe(
    map(([waterfall, versionId]) => waterfallSources(waterfall, versionId))
  );

  public rights$ = combineLatest([this.waterfall$, this.versionId$, this.isRefreshing$]).pipe(
    filter(([_, __, isRefreshing]) => !isRefreshing),
    switchMap(([waterfall, versionId]) => this.rightService.rightsChanges(waterfall, versionId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public statements$ = combineLatest([this.waterfall$, this.versionId$]).pipe(
    switchMap(([waterfall, versionId]) => this.statementService.statementsChanges(waterfall, versionId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public incomes$ = combineLatest([this.waterfall$, this.versionId$]).pipe(
    switchMap(([waterfall, versionId]) => this.incomeService.incomesChanges(waterfall, versionId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public expenses$ = combineLatest([this.movie$, this.statements$, this.versionId$]).pipe(
    switchMap(([{ id: waterfallId }, statements, versionId]) => this.expenseService.expensesChanges(waterfallId, statements, versionId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public hasMinimalRights$ = combineLatest([this.waterfall$, this.rights$, this.versionId$]).pipe(
    map(([waterfall, rights, versionId]) => {
      const sources = waterfallSources(waterfall, versionId);
      if (!sources.length) return false;

      const rightsToCheck = skipGroups(rights);
      const emptyRightHolders = rightsToCheck.some(r => !r.rightholderId);
      if (emptyRightHolders) return false;

      const producerIds = waterfall.rightholders.filter(r => r.roles.includes('producer')).map(r => r.id);

      const emptyContracts = rightsToCheck.some(r => !r.contractId && !producerIds.includes(r.rightholderId));
      if (emptyContracts) return false;

      const destinationRightIds = unique(sources.map(s => s.destinationId));
      return destinationRightIds.every(id => rights.map(r => r.id).includes(id));
    })
  );

  public hasProducer$ = this.waterfall$.pipe(
    map(waterfall => {
      const producers = waterfall.rightholders.filter(r => r.roles.includes('producer'));
      return producers.length === 1;
    })
  );

  public canInitWaterfall$ = combineLatest([this.hasMinimalRights$, this.contracts$, this.hasProducer$]).pipe(
    map(([hasMinimalRights, contracts, hasProducer]) => {
      if (!hasMinimalRights) return false;
      if (!contracts.length) return false;
      if (!hasProducer) return false;

      return true;
    })
  );

  private blocks$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.blockService.valueChanges({ waterfallId }))
  );

  public currentRightholder$ = combineLatest([this.waterfall$, this.permission$]).pipe(
    map(([waterfall, permission]) => permission ? permission.rightholderIds.map(r => waterfall.rightholders.find(rh => rh.id === r)) : []),
    map(rightholders => rightholders.pop()),
    tap(currentRightholder => this.currentRightholder = currentRightholder),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public currentRightholder: WaterfallRightholder;

  // Blocks used for the current version of the state
  public versionBlocks$ = combineLatest([this.versionId$, this.waterfall$, this.blocks$]).pipe(
    filter(([versionId, waterfall, blocks]) => versionId && !!waterfall.versions.length && !!blocks.length),
    map(([versionId, waterfall, blocks]) => {
      const version = waterfall.versions.find(v => v.id === versionId);
      const blockIds = version?.blockIds || [];
      return blockIds.map(id => blocks.find(b => b.id === id));
    }),
    filter(blocks => !blocks.some(b => !b))
  );

  public actions$: Observable<(Action & { block: Block })[]> = this.versionBlocks$.pipe(
    map(blocks => blocks.map(b => Object.values(b.actions).map(a => ({ ...a, block: b }))).flat()),
  );

  public state$ = combineLatest([this.isRefreshing$, this.waterfall$, this.versionId$, this.date$]).pipe(
    filter(([isRefreshing, waterfall]) => !!waterfall.versions.length && !isRefreshing),
    map(([_, waterfall, _versionId, date]) => ({
      waterfall: waterfall,
      versionId: _versionId || getDefaultVersionId(waterfall),
      date
    })),
    filter(config => !!config.versionId && config.waterfall.versions.some(v => v.id === config.versionId)),
    switchMap(config => this.waterfallService.buildWaterfall(config)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public currentVersionName$ = combineLatest([this.waterfall$, this.currentRightholder$, this.canBypassRules$]).pipe(
    switchMap(([waterfall, rightholder, canBypassRules]) => {
      const defaultVersion = getDefaultVersionId(waterfall);
      if (!defaultVersion) return of(null);
      if (rightholder && !canBypassRules) {
        const versionId = rightholder.lockedVersionId || defaultVersion;
        this.lockedVersionId = versionId;
        if (!this.versionId$.value) this.setVersionId(versionId);
        return of(versionId);
      }

      if (!this.versionId$.value) this.setVersionId(defaultVersion);
      return this.versionId$;
    }),
    map(versionId => {
      const name = this.waterfall.versions.find(v => v.id === versionId)?.name;
      const isDefault = isDefaultVersion(this.waterfall, versionId) ? $localize`(default)` : '';
      return name ? `${name} ${isDefault}` : '--';
    })
  );

  /**
   * Observable of the rightholders that have rights on the current state
   */
  public rightholders$ = combineLatest([this.waterfall$, this.state$]).pipe(
    map(([waterfall, state]) => {
      const rightholderIds = Array.from(new Set(Object.values(state.waterfall.state.rights).map(r => r.orgId)));
      return waterfall.rightholders.filter(r => rightholderIds.includes(r.id));
    })
  );

  /**
   * Observable of the statements that current rightholder is allowed to see
   */
  public rightholderStatements$ = combineLatest([this.canBypassRules$, this.currentRightholder$, this.statements$]).pipe(
    map(([canBypassRules, rightholder, statements]) => {
      if (canBypassRules) return statements;
      return filterRightholderStatements(statements, rightholder);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable of the rights that current rightholder is allowed to see
   */
  public rightholderRights$ = combineLatest([this.canBypassRules$, this.currentRightholder$, this.rights$]).pipe(
    map(([canBypassRules, rightholder, rights]) => {
      if (canBypassRules) return rights;
      return getRightsToDisplay(rightholder.id, rights);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable of the sources that current rightholder is allowed to see
   */
  public rightholderSources$ = combineLatest([this.canBypassRules$, this.rightholderRights$, this.sources$]).pipe(
    map(([canBypassRules, rights, sources]) => {
      if (canBypassRules) return sources;
      return sources.filter(s => rights.find(r => r.id === s.destinationId));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  /**
   * Observable of the documents that current rightholder is allowed to see
   */
  public rightholderDocuments$ = combineLatest([this.canBypassRules$, this.permission$, this.documents$]).pipe(
    map(([canBypassRules, permission, documents]) => {
      if (canBypassRules) return documents;
      return documents.filter(d => d.sharedWith?.includes(permission.id));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable of the contracts that current rightholder is allowed to see
   */
  public rightholderContracts$ = this.rightholderDocuments$.pipe(
    map(documents => documents.filter(d => isContract(d))),
    map(documents => sortContracts(documents.map(d => convertDocumentTo<WaterfallContract>(d)))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable of the budget documents that current rightholder is allowed to see
   */
  public rightholderBudgets$ = this.rightholderDocuments$.pipe(
    map(documents => documents.filter(d => isBudget(d))),
    map(documents => documents.map(d => convertDocumentTo<WaterfallBudget>(d))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Observable of the financing plan documents that current rightholder is allowed to see
   */
  public rightholderFinancingPlans$ = this.rightholderDocuments$.pipe(
    map(documents => documents.filter(d => isFinancingPlan(d))),
    map(documents => documents.map(d => convertDocumentTo<WaterfallFinancingPlan>(d))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public amortizations$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.amortizationService.valueChanges({ waterfallId }))
  );

  public lockedVersionId: string; // VersionId that is locked for the current rightholder

  private _simulation$ = new BehaviorSubject<WaterfallState>(undefined);
  public simulation$ = this._simulation$.asObservable().pipe(filter(state => !!state));
  private simulationData: WaterfallData;
  // Used to put current statement in the simulation even if it is not reported yet.
  public currentStatementId$ = new BehaviorSubject<string>(undefined);

  // ---------
  // Graph sidebar options
  // ---------
  public highlightedRightIds$ = new BehaviorSubject<string[]>([]);
  public highlightedSourceIds$ = new BehaviorSubject<string[]>([]);
  public hiddenRightHolderIds$ = new BehaviorSubject<string[]>([]);
  public revenueMode$: BehaviorSubject<'calculated' | 'actual'> = new BehaviorSubject('calculated'); // keyof AmountState

  @Input() routes: RouteDescription[];
  @Input() editRoute?: string | string[];
  @Input() @boolean lite = false;
  @Input() @boolean hideCta = false;

  constructor(
    @Inject(APP) public app: App,
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfallDocumentService: WaterfallDocumentsService,
    private termService: TermService,
    private rightService: RightService,
    private statementService: StatementService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private blockService: BlockService,
    private authService: AuthService,
    private permissionService: WaterfallPermissionsService,
    private amortizationService: AmortizationService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavigationService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const routerSub = this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
    this.subs.push(routerSub);
    this.subs.push(this.canBypassRules$.subscribe());
    this.subs.push(this.currentRightholder$.subscribe());
  }

  private async loadData() {
    const contracts = await this.contracts();
    const rights = await this.rights();
    const incomes = await this.incomes();
    const expenses = await this.expenses();
    const statements = await this.statements();
    const amortizations = await this.amortizations();

    const data: WaterfallData = {
      waterfall: this.waterfall,
      contracts,
      rights,
      incomes: {},
      expenses: {},
      statements,
      amortizations
    };

    for (const income of incomes) {
      data.incomes[income.id] = income;
    }

    for (const expense of expenses) {
      data.expenses[expense.id] = expense;
    }

    return data;
  }

  async contracts(ids: string[] = []) {
    const params = { waterfallId: this.waterfall.id };
    const contracts = ids.length ?
      await this.waterfallDocumentService.getValue(ids, params) :
      await this.waterfallDocumentService.getValue([where('type', '==', 'contract')], params);
    return contracts.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
  }

  rights(versionId = this.versionId$.value) {
    return this.rightService.rights(this.waterfall, versionId);
  }

  incomes(ids?: string[], versionId = this.versionId$.value) {
    return this.incomeService.incomes(this.waterfall, ids, versionId);
  }

  statements(versionId = this.versionId$.value) {
    return this.statementService.statements(this.waterfall, versionId);
  }

  async expenses(ids?: string[], versionId = this.versionId$.value) {
    const statements = await this.statements(versionId);
    return this.expenseService.expenses(this.waterfall.id, statements, ids, versionId);
  }

  terms() {
    return this.termService.getValue([where('titleId', '==', this.waterfall.id)]);
  }

  amortizations() {
    return this.amortizationService.getValue({ waterfallId: this.waterfall.id });
  }

  setVersionId(versionId: string) {
    if (!versionId) return;
    if (this.versionId$.value === versionId) return;
    this.versionId$.next(versionId);
    return true;
  }

  setDate(date: Date) {
    if (this._date?.getTime() === date?.getTime()) return false;
    this.date$.next(date);
    this._date = date;
    return true;
  }

  async initWaterfall(version: Partial<Version> = { id: `version_${this.waterfall.versions.length + 1}`, description: `Version ${this.waterfall.versions.length + 1}` }) {
    if (!this.canBypassRules) throw new Error('You are not allowed to create waterfall');
    this.snackBar.open(`Creating version "${version.id}"... Please wait`, 'close');
    this.isRefreshing$.next(true);
    this.setVersionId(version.id);
    const data = await this.loadData();
    const waterfall = await this.waterfallService.initWaterfall(data, version);
    this.isRefreshing$.next(false);
    this.snackBar.open(`Version "${version.id}" initialized !`, 'close', { duration: 5000 });
    return waterfall;
  }

  async removeVersion(versionId: string) {
    if (!this.canBypassRules) throw new Error('You are not allowed to remove waterfall');
    const data = await this.loadData();
    return this.waterfallService.removeVersion(data, versionId);
  }

  async duplicateVersion(versionIdToDuplicate: string, version?: Partial<Version>) {
    if (!this.canBypassRules) throw new Error('You are not allowed to duplicate waterfall');
    const waterfall = await firstValueFrom(this.waterfall$);
    const blocks = await firstValueFrom(this.blocks$);
    const versionToDuplicate = waterfall.versions.find(v => v.id === versionIdToDuplicate);
    if (!versionIdToDuplicate) throw new Error(`Version ${versionIdToDuplicate} to duplicate not found in waterfall`);
    return this.waterfallService.duplicateVersion(waterfall, blocks, versionToDuplicate, version);
  }

  /**
   * If current version is not standalone, refresh all waterfalls except standalones
   * If current version is standalone, refresh only the current one
   * @returns 
   */
  async refreshAllWaterfalls() {
    if (!this.canBypassRules) throw new Error('You are not allowed to refresh waterfalls');
    const currentVersion = this.versionId$.value;
    if (!currentVersion || isStandaloneVersion(this.waterfall, currentVersion)) return this.refreshWaterfall();
    this.isRefreshing$.next(true);
    const notStandaloneVersions = this.waterfall.versions.filter(v => !v.standalone);
    for (const version of notStandaloneVersions) {
      this.setVersionId(version.id);
      await this.refreshWaterfall(false);
    }
    this.setVersionId(currentVersion);
    this.isRefreshing$.next(false);
  }

  async refreshWaterfall(markAsRefreshing = true) {
    if (!this.canBypassRules) throw new Error('You are not allowed to refresh waterfall');
    if (markAsRefreshing) this.isRefreshing$.next(true);
    const data = this.versionId$.value ? await this.loadData() : undefined;
    const waterfall = this.versionId$.value ? await this.waterfallService.refreshWaterfall(data, this.versionId$.value) : await this.initWaterfall();
    if (markAsRefreshing) this.isRefreshing$.next(false);
    return waterfall;
  }

  /**
   * Starts a waterfall simulation with existing db data
   */
  async simulateWaterfall() {
    this.isRefreshing$.next(true);
    this.simulationData = await this.loadData();
    const waterfall = await this.waterfallService.simulateWaterfall(this.simulationData, this.versionId$.value, this.date$.value, this.currentStatementId$.value);
    this._simulation$.next(waterfall);
    this.isRefreshing$.next(false);
    return waterfall;
  }

  /**
   * Simulates a waterfall with the given incomes and expenses in addition to existing simulation data
   * @param incomes 
   * @param expenses 
   * @param options
   */
  async appendToSimulation(append: { incomes?: Income[], expenses?: Expense[] } = { incomes: [], expenses: [] }, options: { fromScratch?: boolean, resetData?: boolean } = { fromScratch: false, resetData: false }) {
    this.isRefreshing$.next(true);
    if (!this.simulationData || options.resetData) this.simulationData = await this.loadData();

    for (const income of append.incomes || []) {
      this.simulationData.incomes[income.id] = income;
    }

    for (const expense of append.expenses || []) {
      this.simulationData.expenses[expense.id] = expense;
    }

    // If fromScratch is true, we remove all previous incomes, expenses and statements from the simulation
    const cleanData = { ...this.simulationData, incomes: append.incomes || {}, expenses: append.expenses || {}, statements: [] };
    const data = options.fromScratch ? cleanData : this.simulationData;
    const waterfall = await this.waterfallService.simulateWaterfall(data, this.versionId$.value, this.date$.value, this.currentStatementId$.value);
    this._simulation$.next(waterfall);
    this.isRefreshing$.next(false);
    return waterfall;
  }

  /**
   * Iterates over state to fetch Income Ids that can 
   * be used to generate producer (outgoing) statements 
   * @param producerId
   * @param receiverId 
   * @param contractId 
   * @param date 
   */
  public async getIncomeIds(producerId: string, receiverId: string, contractId: string, date: Date) {
    const incomes = await this.incomes();
    const state = await firstValueFrom(this.state$);
    const statements = await this.statements();
    const rights = await this.rights();
    const contracts = await this.contracts();

    // Outgoing statement prerequists config
    const config = {
      senderId: producerId,
      receiverId,
      statements,
      contracts,
      rights,
      titleState: state.waterfall.state,
      incomes,
      sources: this.waterfall.sources,
      date
    };

    const prerequists = getOutgoingStatementPrerequists(config);

    if (!Object.keys(prerequists).length) return [];
    if (!prerequists[contractId]) return [];
    const prerequist = prerequists[contractId];
    return prerequist.incomeIds;
  }

  ngOnDestroy() {
    this.subs.forEach(s => s?.unsubscribe());
  }

  goBack() {
    const fallbackUrl = this.app === 'crm' ? '/c/o/dashboard/crm/waterfalls' : '/c/o/dashboard/title';
    this.navService.goBack(this.countRouteEvents, [fallbackUrl]);
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}

@Pipe({ name: 'canAccess' })
export class CanAccesPipe implements PipeTransform {
  transform(link: RouteDescription, isAdmin: boolean, waterfallReady: boolean) {
    if (!link.requireKeys) return true;
    return link.requireKeys.every(key => {
      if (key === 'admin') return isAdmin;
      if (key === 'waterfall-ready') return waterfallReady;
    });
  }
}
