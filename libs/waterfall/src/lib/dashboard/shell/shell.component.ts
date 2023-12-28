import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  Directive,
  Inject,
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
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { filter, map, pluck, switchMap, tap } from 'rxjs/operators';
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
  private sub: Subscription;
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
    map(([isWaterfallAdmin, isBlockframesAdmin]) => isWaterfallAdmin || isBlockframesAdmin)
  );

  public currentRightholder$ = this.permission$.pipe(
    map(permission => permission ? permission.rightholderIds.map(r => this.waterfall.rightholders.find(rh => rh.id === r)) : []),
    map(rightholders => rightholders.pop())
  );

  // ---------
  // Contracts, Terms and Documents
  // ---------
  public documents$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.waterfallDocumentService.valueChanges({ waterfallId }))
  );

  public contracts$ = this.documents$.pipe(
    map(documents => documents.filter(d => isContract(d))),
    map(documents => sortContracts(documents.map(d => convertDocumentTo<WaterfallContract>(d))))
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

  // ---------
  // Statements, Incomes and Expenses
  // ---------
  public statements$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.statementService.valueChanges({ waterfallId }))
  );

  public incomes$ = combineLatest([this.movie$, this.versionId$]).pipe(
    switchMap(([{ id: waterfallId }, versionId]) => this.incomeService.incomesChanges(waterfallId, versionId))
  );

  public expenses$ = combineLatest([this.movie$, this.versionId$]).pipe(
    switchMap(([{ id: waterfallId }, versionId]) => this.expenseService.expensesChanges(waterfallId, versionId))
  );

  // ---------
  // Waterfall, Blocks, Rights and State
  // ---------
  public waterfall$ = this.movie$.pipe(
    switchMap(movie => this.waterfallService.valueChanges(movie.id)),
    tap(waterfall => this.waterfall = waterfall)
  );
  public waterfall: Waterfall;

  public rights$ = this.movie$.pipe(
    // TODO #9520 same as for income & expense.
    switchMap(({ id: waterfallId }) => this.rightService.valueChanges({ waterfallId }))
  );

  public hasMinimalRights$ = combineLatest([this.waterfall$, this.rights$]).pipe(
    map(([waterfall, rights]) => {
      if (!waterfall.sources.length) return false;
      const destinationRightIds = unique(this.waterfall.sources.map(s => s.destinationId));
      return destinationRightIds.every(id => rights.map(r => r.id).includes(id));
    })
  );

  public canInitWaterfall$ = combineLatest([this.hasMinimalRights$, this.contracts$]).pipe(
    map(([hasMinimalRights, contracts]) => {
      if (!hasMinimalRights) return false;
      if (!contracts.length) return false;
      return true;
    })
  );

  private blocks$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.blockService.valueChanges({ waterfallId }))
  );

  // Blocks used for the current version of the state
  public versionBlocks$ = combineLatest([this.versionId$, this.waterfall$, this.blocks$]).pipe(
    filter(([versionId, waterfall, blocks]) => versionId && !!waterfall.versions.length && !!blocks.length),
    map(([versionId, waterfall, blocks]) => {
      const version = waterfall.versions.find(v => v.id === versionId);
      const blockIds = version.blockIds || [];
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
      versionId: _versionId || waterfall.versions[0]?.id,
      date
    })),
    switchMap(config => this.waterfallService.buildWaterfall(config))
  );

  public currentVersionName$ = combineLatest([this.waterfall$, this.currentRightholder$, this.canBypassRules$]).pipe(
    switchMap(([waterfall, rightholder, canBypassRules]) => {
      if (!waterfall.versions[0]?.id) return of(null);
      if (rightholder && !canBypassRules) {
        const versionId = 'version_3'; // TODO #9520 return rightholder.versionId;
        this.lockedVersionId = versionId;
        if (!this.versionId$.value) this.setVersionId(versionId);
        return of(versionId);
      }

      if (!this.versionId$.value) this.setVersionId(waterfall.versions[0]?.id);
      return this.versionId$;
    }),
    map(versionId => this.waterfall.versions.find(v => v.id === versionId)?.name || '--')
  );
  public lockedVersionId: string; // VersionId that is locked for the current rightholder

  private _simulation$ = new BehaviorSubject<WaterfallState>(undefined);
  public simulation$ = this._simulation$.asObservable().pipe(filter(state => !!state));
  private simulationData: WaterfallData;

  @Input() routes: RouteDescription[];
  @Input() editRoute?: string | string[];
  @Input() @boolean lite = false;

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
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavigationService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
  }

  private async loadData() {
    const contracts = await this.contracts();
    const rights = await this.rights();
    const incomes = await this.incomes();
    const expenses = await this.expenses();
    const statements = await this.statements();
    const terms = await this.terms();

    const data: WaterfallData = {
      waterfall: this.waterfall,
      contracts,
      rights,
      incomes: {},
      expenses: {},
      statements,
      terms
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
    // TODO #9520 rights should be fitered by the current version this.versionId$
    return this.rightService.getValue({ waterfallId: this.waterfall.id });
  }

  incomes(ids: string[] = [], versionId = this.versionId$.value) {
    return this.incomeService.incomes(this.waterfall.id, ids, versionId);
  }

  statements() {
    return this.statementService.getValue({ waterfallId: this.waterfall.id });
  }

  expenses(ids: string[] = [], versionId = this.versionId$.value) {
    return this.expenseService.expenses(this.waterfall.id, ids, versionId);
  }

  terms() {
    return this.termService.getValue([where('titleId', '==', this.waterfall.id)]);
  }

  setVersionId(versionId: string) {
    if (!versionId) return;
    if (this.versionId$.value === versionId) return;
    this.versionId$.next(versionId);
  }

  setDate(date: Date) {
    if (this._date?.getTime() === date?.getTime()) return false;
    this.date$.next(date);
    this._date = date;
    return true;
  }

  async initWaterfall(version: Partial<Version> = { id: `version_${this.waterfall.versions.length + 1}`, description: `Version ${this.waterfall.versions.length + 1}` }) {
    const canBypassRules = await firstValueFrom(this.canBypassRules$);
    if (!canBypassRules) throw new Error('You are not allowed to create waterfall');
    this.snackBar.open(`Creating version "${version.id}"... Please wait`, 'close');
    this.isRefreshing$.next(true);
    const data = await this.loadData();
    const waterfall = await this.waterfallService.initWaterfall(data, version);
    this.setVersionId(version.id);
    this.isRefreshing$.next(false);
    this.snackBar.open(`Version "${version.id}" initialized !`, 'close', { duration: 5000 });
    return waterfall;
  }

  async removeVersion(versionId: string) {
    const canBypassRules = await firstValueFrom(this.canBypassRules$);
    if (!canBypassRules) throw new Error('You are not allowed to remove waterfall');
    const data = await this.loadData();
    return this.waterfallService.removeVersion(data, versionId);
  }

  async duplicateVersion(versionId: string) {
    const canBypassRules = await firstValueFrom(this.canBypassRules$);
    if (!canBypassRules) throw new Error('You are not allowed to duplicate waterfall');
    const waterfall = await firstValueFrom(this.waterfall$);
    const blocks = await firstValueFrom(this.blocks$);
    return this.waterfallService.duplicateVersion(waterfall, blocks, versionId);
  }

  async refreshWaterfall(_versionId?: string) {
    const canBypassRules = await firstValueFrom(this.canBypassRules$);
    if (!canBypassRules) throw new Error('You are not allowed to refresh waterfall');
    this.isRefreshing$.next(true);
    const data = await this.loadData();
    const versionId = _versionId || this.versionId$.value;
    const waterfall = versionId ? await this.waterfallService.refreshWaterfall(data, versionId) : await this.initWaterfall();
    this.isRefreshing$.next(false);
    return waterfall;
  }

  /**
   * Starts a waterfall simulation with existing db data
   */
  async simulateWaterfall() {
    this.isRefreshing$.next(true);
    this.simulationData = await this.loadData();
    const waterfall = await this.waterfallService.simulateWaterfall(this.simulationData, this.versionId$.value, this.date$.value);
    this._simulation$.next(waterfall);
    this.isRefreshing$.next(false);
    return waterfall;
  }

  /**
   * Simulates a waterfall with the given incomes and expenses in addition to existing simulation data
   * @param incomes 
   * @param expenses 
   */
  async appendToSimulation(append: { incomes?: Income[], expenses?: Expense[] } = { incomes: [], expenses: [] }) {
    this.isRefreshing$.next(true);
    if (!this.simulationData) this.simulationData = await this.loadData();

    for (const income of append.incomes || []) {
      this.simulationData.incomes[income.id] = income;
    }

    for (const expense of append.expenses || []) {
      this.simulationData.expenses[expense.id] = expense;
    }

    const waterfall = await this.waterfallService.simulateWaterfall(this.simulationData, this.versionId$.value, this.date$.value);
    this._simulation$.next(waterfall);
    this.isRefreshing$.next(false);
    return waterfall;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    const fallbackUrl = this.app === 'crm' ? '/c/o/dashboard/crm/waterfalls' : '/c/o/dashboard/title';
    this.navService.goBack(this.countRouteEvents, [fallbackUrl]);
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
