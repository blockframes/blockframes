import { Component, ChangeDetectionStrategy, Host, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService, Movie } from '@blockframes/movie';
import { TunnelStep, TunnelConfirmComponent } from '@blockframes/ui/tunnel'
import { ContractForm } from '../form/contract.form';
import { ContractQuery, ContractService, ContractType } from '../+state';
import { Observable, from, of, Subscription, combineLatest } from 'rxjs';
import { startWith, map, switchMap, tap, shareReplay } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ContractVersionService } from '@blockframes/contract/version/+state';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { FormEntity, FormList } from '@blockframes/utils';
import { ContractTitleDetailForm } from '@blockframes/contract/version/form';
import { DistributionDealService, DistributionDeal } from '@blockframes/movie/distribution-deals/+state';

const steps = [{
  title: 'Step 1',
  icon: 'document',
  routes: [{
    path: 'details',
    label: 'contract Details'
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

  public movies$: Observable<Movie[]>;
  public dealForms = new FormEntity<DealControls>({});
  public contractForm: ContractForm;

  constructor(
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private service: ContractService,
    private versionService: ContractVersionService,
    private query: ContractQuery,
    private movieService: MovieService,
    private dealService: DistributionDealService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.type = contract.type;
    this.contractForm = new ContractForm(contract);
    
    // Set the initial deals
    contract.titleIds.forEach(async movieId => {
      const deals = await this.dealService.getValue({ params: { movieId }});
      this.dealForms.setControl(movieId, FormList.factory(deals, deal => new DistributionDealForm(deal)));
    });


    // Listen on the changes of the titles from the contract form
    const titlesForm = this.contractForm.get('versions').last().get('titles');
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
  }

  /** Add a title to this contract */
  addTitle(movieId: string) {
    this.contractForm.get('versions').last().get('titles').setControl(movieId, new ContractTitleDetailForm());
    this.dealForms.setControl(movieId, FormList.factory([], deal => new DistributionDealForm(deal)));
  }

  /** Remove a title to this contract */
  removeTitle(movieId: string) {
    this.contractForm.get('versions').last().get('titles').removeControl(movieId);
    const deals = this.dealForms.get(movieId).value;
    // start from the end to remove to avoid shift effects
    for (let i = deals.length - 1; i >= 0; i--) {
      this.removeDeal(movieId, i);
    }
    this.dealForms.removeControl(movieId);
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

  /** Save Contract, Contract Version and deals */
  public save() {
    const write = this.db.firestore.batch();
    const contractId = this.query.getActiveId();
    const contract = { ...this.contractForm.value };

    // Upate Version
    const lastIndex = contract.versions.length - 1;
    const version = { ...contract.versions[lastIndex] };
    this.versionService.update({ id: `${lastIndex}`, ...version }, { params: { contractId }, write })

    // Update Contract
    contract.titleIds = Object.keys(version.titles || {});
    delete contract.versions;
    this.service.update({ id: contractId, ...contract }, { write });

    // Upsert deals
    for (const movieId in this.dealForms.controls) {
      const deals = this.dealForms.controls[movieId].value;
      for (const deal of deals) {
        if (deal.id) {
          this.dealService.add({ contractId, ...deal }, { params: { movieId }, write })
        } else {
          this.dealService.update(deal, { params: { movieId }, write });
        }
      }
    }

    // Remove deals
    for (const movieId in this.removedDeals) {
      for (const dealId of this.removedDeals[movieId]) {
        this.dealService.remove(dealId, { params: { movieId }, write })
      }
    }
    this.removedDeals = {};

    // Return an observable<boolean> for the confirmExit
    return from(write.commit()).pipe(
      tap(_ => {
        this.contractForm.markAsPristine();
        this.dealForms.markAsPristine();
      }),
      switchMap(_ => this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed()),
      map(_ => true) 
    )
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
