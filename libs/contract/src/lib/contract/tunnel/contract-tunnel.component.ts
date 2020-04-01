import { Router, ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelConfirmComponent } from '@blockframes/ui/tunnel'
import { ContractForm } from '../form/contract.form';
import { ContractQuery, ContractService, ContractType, createContract, TitlesAndDeals } from '../+state';
import { MatDialog } from '@angular/material/dialog';
import { DistributionDealForm } from '@blockframes/distribution-deals/form/distribution-deal.form';
import { FormEntity, FormList } from '@blockframes/utils/form/forms';
import { ContractTitleDetailForm } from '@blockframes/contract/version/form';
import { DistributionDealService, DistributionDeal, createDistributionDeal } from '@blockframes/distribution-deals/+state';
import { startWith, map, switchMap, shareReplay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
import { AngularFirestore } from '@angular/fire/firestore';

const steps = [{
  title: 'Step 1',
  icon: 'document',
  routes: [{
    path: 'details',
    label: 'Contract Details'
  }]
}, {
  title: 'Summary',
  icon: 'send',
  routes: [{
    path: 'summary',
    label: 'Summary'
  }]
}]

/** Fill the steps depending on the movie */
function fillMovieSteps(movies: Movie[] = []): TunnelStep[] {
  if (!movies.length) {
    return steps
  }
  return [{
    ...steps[0]
  }, {
    title: 'Exploitation Rights',
    icon: 'world',
    routes: movies.map(movie => ({
      path: movie.id, label: movie.main.title.international
    }))
  }, {
    ...steps[1]
  }]
}

export type DealControls = Record<string, FormList<DistributionDeal, DistributionDealForm>>;

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTunnelComponent implements OnInit {
  /** Keep track of the deals removed */
  private removedDeals: Record<string, string[]> = {};
  public steps$: Observable<TunnelStep[]>;
  public type: ContractType;
  public exitRoute$: Observable<string>;

  public movies$: Observable<Movie[]>;
  public dealForms = new FormEntity<DealControls>({});
  public contractForm: ContractForm;

  constructor(
    private orgQuery: OrganizationQuery,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private query: ContractQuery,
    private movieService: MovieService,
    private dealService: DistributionDealService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.type = contract.type;
    this.contractForm = new ContractForm(contract);

    // Set the initial deals
    Object.keys(contract.lastVersion.titles).forEach(async movieId => {
      const deals = await this.dealService.getContractDistributionDeals(contract.id, movieId);
      this.dealForms.setControl(movieId, FormList.factory(deals, deal => new DistributionDealForm(deal)));
    });

    // Listen on the changes of the titles from the contract form
    const titlesForm = this.contractForm.get('lastVersion').get('titles');
    this.movies$ = titlesForm.valueChanges.pipe(
      startWith(titlesForm.value),
      map(titles => Object.keys(titles)),
      switchMap(titleIds => this.movieService.getValue(titleIds)),
      shareReplay()
    );

    // Update the step
    this.steps$ = this.movies$.pipe(
      map(movies => fillMovieSteps(movies))
    );

    this.exitRoute$ = this.route.paramMap.pipe(map(value => {
      /**
       * We need to distinguish between exit on details
       * or on exploitation rights, different sizes of routes
       */
      if (value.keys.length === 1) {
        return `../../../../deals/${value.get('contractId')}`;
      } else {
        return `../../../../../deals/${value.get('contractId')}`;
      }
    }))
  }

  /** Add a title to this contract */
  addTitle(movieId: string, mandate?: boolean) {
    this.contractForm
      .get('lastVersion')
      .get('titles')
      .setControl(movieId, new ContractTitleDetailForm(mandate ? { price: { amount: 0 } } : {}));
    this.dealForms.setControl(movieId, FormList.factory([], deal => new DistributionDealForm(deal)));
  }

  /**
   * Removes a title from the contract form
   * @param movieId 
   * @param isExploitRight 
   */
  removeTitle(movieId: string, isExploitRight?: boolean) {
    this.contractForm.get('lastVersion').get('titles').removeControl(movieId);
    const deals = this.dealForms.get(movieId).value;
    // start from the end to remove to avoid shift effects
    for (let i = deals.length - 1; i >= 0; i--) {
      this.removeDeal(movieId, i);
    }
    // if we are in exploitation rights section of the tunnel
    // we want to go to the next movie
    if (isExploitRight) {
      this.dealForms.removeControl(movieId);
      const dealIds = Object.keys(this.dealForms.controls)
      if (!dealIds.length) {
        this.router.navigate(['details'], { relativeTo: this.route })
      } else {
        this.router.navigate([dealIds[dealIds.length - 1]], { relativeTo: this.route })
      }
    }
  }

  /** Add a deal to a title */
  addDeal(movieId: string) {
    this.dealForms.get(movieId).add();
  }

  /** Remove a deal from a title */
  removeDeal(movieId: string, index: number) {
    const deal = this.dealForms.get(movieId).at(index).value;
    if (deal.id) {
      this.removedDeals[movieId]
        ? this.removedDeals[movieId].push(deal.id)
        : this.removedDeals[movieId] = [deal.id];
    }
    this.dealForms.get(movieId).removeAt(index);
  }

  /** 
   * Save Contract, Contract Version and deals
   * @dev At this point, deals may already exists 
   * (ie: created when clicked on "create an offer" from selection page).
   * but deals may have been edited, added or removed and the contract may
   * have changed too in the contract tunnel form.
   */
  public async save() {

    const orgId = this.orgQuery.getActiveId();
    const titlesAndDeals = {} as TitlesAndDeals;

    for (const movieId in this.dealForms.controls) {
      const deals = this.dealForms.get(movieId).value.map(deal => createDistributionDeal(deal));
      titlesAndDeals[movieId] = deals;
    }

    const contract = createContract({
      ...this.query.getActive(),
      ...this.contractForm.value
    });

    //@TODO (#2404) Problem: here this.contractForm.value.lastVersion[titleId].price.amount === 0
    await this.contractService.createContractAndDeal(orgId, titlesAndDeals, contract);

    // Remove deals
    const write = this.db.firestore.batch();
    for (const movieId in this.removedDeals) {
      for (const dealId of this.removedDeals[movieId]) {
        this.dealService.remove(dealId, { params: { movieId }, write })
      }
    }
    this.removedDeals = {};
    await write.commit();

    this.contractForm.markAsPristine();
    this.dealForms.markAsPristine();
    await this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    if (this.contractForm.pristine && this.dealForms.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => shouldSave ? this.save() : of(false))
    );
  }
}
