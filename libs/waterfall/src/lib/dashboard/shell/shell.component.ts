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
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, Subscription } from 'rxjs';
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
  sortContracts
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { filter, map, pluck, switchMap, tap } from 'rxjs/operators';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { WaterfallData, WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';
import { RightService } from '@blockframes/waterfall/right.service';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { BlockService } from '@blockframes/waterfall/block.service';
import { unique } from '@blockframes/utils/helpers';
import { APP } from '@blockframes/utils/routes/utils';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { AuthService } from '@blockframes/auth/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({ selector: 'waterfall-cta, [waterfallCta]' })
export class WaterfallCtaDirective { }

@Component({
  selector: '[routes] waterfall-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWaterfallShellComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private countRouteEvents = 1;

  public movie$ = this.route.params.pipe(
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

  public canBypassRules$ = combineLatest([this.isWaterfallAdmin$, this.authService.isBlockframesAdmin$]).pipe(
    map(([isWaterfallAdmin, isBlockframesAdmin]) => isWaterfallAdmin || isBlockframesAdmin)
  );

  public currentRightholder$ = this.permission$.pipe(
    map(permission => permission.rightholderIds.map(r => this.waterfall.rightholders.find(rh => rh.id === r))),
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

  public incomes$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.incomeService.valueChanges([where('titleId', '==', waterfallId)]))
  );

  public expenses$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.expenseService.valueChanges([where('titleId', '==', waterfallId)]))
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
    switchMap(({ id: waterfallId }) => this.rightService.valueChanges({ waterfallId }))
  );

  public blocks$ = this.movie$.pipe(
    switchMap(({ id: waterfallId }) => this.blockService.valueChanges({ waterfallId }))
  );

  private data$: Observable<WaterfallData> = combineLatest([
    this.waterfall$, this.documents$, this.rights$, this.incomes$,
    this.expenses$, this.statements$, this.blocks$, this.terms$
  ]).pipe(
    map(([waterfall, documents, rights, incomes, expenses, statements, blocks, terms]) => ({
      waterfall,
      documents,
      contracts: documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c)),
      rights,
      incomes,
      expenses,
      statements,
      blocks,
      terms,
    }))
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

  private versionId$ = new BehaviorSubject<string>(undefined);
  private date$ = new BehaviorSubject<Date>(undefined);
  public isRefreshing$ = new BehaviorSubject<boolean>(false);

  public actions$: Observable<(Action & { block: Block })[]> = this.versionId$.pipe(
    switchMap(versionId => this.waterfall$.pipe(map(v => v.versions.find(v => v.id === versionId)?.blockIds || []))),
    switchMap(blockIds => this.blocks$.pipe(map(blocks => blocks.filter(b => blockIds.includes(b.id))))),
    map(blocks => blocks.map(b => Object.values(b.actions).map(a => ({ ...a, block: b }))).flat()),
  );

  public state$ = combineLatest([this.isRefreshing$, this.waterfall$, this.versionId$, this.date$, this.canBypassRules$]).pipe(
    filter(([isRefreshing, waterfall]) => !!waterfall.versions.length && !isRefreshing),
    map(([_, waterfall, _versionId, date, canBypassRules]) => ({
      waterfallId: waterfall.id,
      versionId: _versionId || waterfall.versions[0]?.id,
      date,
      canBypassRules
    })),
    switchMap(config => this.waterfallService.buildWaterfall(config))
  );

  @Input() routes: RouteDescription[];
  @Input() editRoute?: string | string[];

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

  setVersionId(versionId: string) {
    this.versionId$.next(versionId);
  }

  setDate(date: Date) {
    this.date$.next(date);
  }

  async initWaterfall(version: Partial<Version> = { id: `version_${this.waterfall.versions.length + 1}`, description: `Version ${this.waterfall.versions.length + 1}` }) {
    this.snackBar.open(`Creating version "${version.id}"... Please wait`, 'close');
    this.isRefreshing$.next(true);
    const data = await firstValueFrom(this.data$);
    const waterfall = await this.waterfallService.initWaterfall(data, version);
    this.isRefreshing$.next(false);
    this.snackBar.open(`Version "${version.id}" initialized !`, 'close', { duration: 5000 });
    return waterfall;
  }

  async removeVersion(versionId: string) {
    const data = await firstValueFrom(this.data$);
    return this.waterfallService.removeVersion(data, versionId);
  }

  async duplicateVersion(versionId: string) {
    const waterfall = await firstValueFrom(this.waterfall$);
    const blocks = await firstValueFrom(this.blocks$);
    return this.waterfallService.duplicateVersion(waterfall, blocks, versionId);
  }

  async refreshWaterfall(versionId: string) {
    this.isRefreshing$.next(true);
    const data = await firstValueFrom(this.data$);
    const waterfall = await this.waterfallService.refreshWaterfall(data, versionId);
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
