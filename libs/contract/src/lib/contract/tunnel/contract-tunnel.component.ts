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
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';

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

type DealControl = Record<string, FormList<DistributionDealForm>>;

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTunnelComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public steps$: Observable<TunnelStep[]>;
  public type: ContractType;

  public movies$: Observable<Movie[]>;
  public dealForms = new FormEntity<DealControl>({});
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

    // Listen on the changes of the titles from the contract form
    const titlesForm = this.contractForm.get('versions').last().get('titles');
    const titleIds$ = titlesForm.valueChanges.pipe(
      startWith(titlesForm.value),
      map(titles => Object.keys(titles)),
    );

    // Get all the movies of the contract
    this.movies$ = titleIds$.pipe(
      switchMap(titleIds => this.movieService.getValue(titleIds)),
      shareReplay()
    );
    
    // Update the step
    this.steps$ = this.movies$.pipe(
      map(movies => fillMovieSteps(movies))
    );

    // Update the deal form for each title
    this.sub = titleIds$.pipe(
      switchMap(titleIds => {
        const setdealForms = titleIds.map(async movieId => {
          const deals = await this.dealService.getValue({ params: { movieId }});
          if (this.dealForms.get(movieId)) {
            this.dealForms.get(movieId).patchAllValue(deals);
          } else {
            this.dealForms.setControl(movieId, FormList.factory(deals, deal => new DistributionDealForm(deal)))
          }
        })
        return combineLatest(setdealForms)
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Add a title to this contract */
  addTitle(movieId: string) {
    this.contractForm.get('versions').last().get('titles').setControl(movieId, new ContractTitleDetailForm());
    this.dealForms.setControl(movieId, FormList.factory([], deal => new DistributionDealForm(deal)));
    const contractId = this.query.getActiveId();
    this.dealService.add({ contractId }, { params: { movieId }});
  }

  /** Remove a title to this contract */
  removeTitle(movieId: string) {
    this.contractForm.get('versions').last().get('titles').removeControl(movieId);
    this.dealForms.removeControl(movieId);
    this.dealService.removeAll({ params: { movieId }});
  }

  /** Add a deal to a title */
  addDeal(movieId: string) {
    this.dealService.add({}, { params: { movieId }});
  }

  /** Remove a deal from a title */
  removeDeal(movieId: string, dealId: string) {
    this.dealService.remove(dealId, { params: { movieId }});
  }

  /** Save Contract, Contract Version and deals */
  public save() {
    const write = this.db.firestore.batch();
    const contractId = this.query.getActiveId();
    const contract = this.contractForm.value;

    // Upate Version
    const lastIndex = contract.versions.length - 1;
    const version = { ...contract.versions[lastIndex] };
    this.versionService.update({ id: `${lastIndex}`, ...version }, { params: { contractId }, write })

    // Update Contract
    contract.titleIds = Object.keys(version.titles);
    delete contract.versions;
    this.service.update({ id: contractId, ...contract }, { write });

    // Update deals
    for (const movieId in this.dealForms.controls) {
      const deal = this.dealForms.controls[movieId].value;
      this.dealService.update(deal, { params: { movieId }, write });
    }

    // Return an observable<boolean> for the confirmExit
    return from(write.commit()).pipe(
      tap(_ => this.contractForm.markAsPristine()),
      switchMap(_ => this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed()),
      map(_ => true) 
    )
  }

  confirmExit() {
    if (this.contractForm.pristine) {
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
