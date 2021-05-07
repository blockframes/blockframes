import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { TerritoryValue, territoriesISOA3 } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { ContractService, isMandate, isSale, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { availableTerritories, getSoldTerms, getTerritories, TerritoryMarker, toTerritoryMarker } from '@blockframes/contract/avails/avails';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketForm } from '@blockframes/contract/bucket/form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { map, startWith, switchMap } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ExplanationComponent } from './explanation/explanation.component';

@Component({
  selector: 'catalog-movie-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieAvailsComponent implements OnInit, OnDestroy {
  public movie: Movie = this.movieQuery.getActive();
  public org$: Observable<Organization>;
  public orgId = this.orgQuery.getActiveId();
  public periods = ['weeks', 'months', 'years'];
  private sub: Subscription;

  private mandates: Mandate[];
  private sales: Sale[];
  private mandateTerms: Term<Date>[];
  private salesTerms: Term<Date>[];

  /** Languages Form */
  public languageCtrl = new FormControl();
  public showButtons = true;

  public hoveredTerritory: {
    name: string;
    status: string;
  }

  public bucketForm = new BucketForm();
  public availsForm = new AvailsForm({ territories: [] }, ['duration']);
  public terms$ = this.bucketForm.selectTerms(this.movie.id);

  /** List of world map territories */
  territoryMarkers: { [key: string]: TerritoryMarker } = {};
  sold$ = new BehaviorSubject<TerritoryMarker[]>([]);

  selected$ = combineLatest([
    this.availsForm.value$,
    this.bucketForm.value$,
  ]).pipe(
    startWith([]),
    map(([avail]) => !!avail ? getTerritories(avail, this.bucketForm.value, 'exact').map(t => this.territoryMarkers[t]) : []));

  inSelection$ = combineLatest([
    this.availsForm.value$,
    this.bucketForm.value$,
  ]).pipe(
    startWith([]),
    map(([avail]) => !!avail ? getTerritories(avail, this.bucketForm.value, 'in').map(t => this.territoryMarkers[t]) : []));

  available$ = combineLatest([
    this.selected$,
    this.sold$,
    this.inSelection$
  ]).pipe(
    map(([selected, sold, inSelection]) => {
      if (this.availsForm.invalid) return [];
      return availableTerritories(selected, sold, inSelection, this.availsForm.value, this.mandates, this.mandateTerms);
    })
  )

  public isCalendar = false;

  constructor(
    private movieQuery: MovieQuery,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private contractService: ContractService,
    private termService: TermService,
    private snackBar: MatSnackBar,
    private bucketQuery: BucketQuery,
    private dialog: MatDialog,
    private bucketService: BucketService
  ) { }

  public async ngOnInit() {
    this.org$ = this.orgService.valueChanges(this.movieQuery.getActive().orgIds[0]);

    this.sub = this.bucketQuery.selectActive().subscribe(bucket => {
      this.bucketForm.patchAllValue(bucket);
      this.bucketForm.change.next();
    });

    const contracts = await this.contractService.getValue(ref => ref.where('titleId', '==', this.movie.id).where('status', '==', 'accepted'));

    this.mandates = contracts.filter(isMandate);
    this.sales = contracts.filter(isSale);

    this.mandateTerms = await this.termService.getValue(this.mandates.map(m => m.termIds).flat());
    this.salesTerms = await this.termService.getValue(this.sales.map(m => m.termIds).flat());

    for (const term of this.mandateTerms) {
      for (const territory of term.territories) {
        if (territory in territoriesISOA3) {
          this.territoryMarkers[territory] = toTerritoryMarker(territory, term.contractId, this.mandates);
        }
      }
    }

  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  confirmExit() {
    const isPristine = this.bucketForm.pristine;
    if (isPristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'You are about to leave the page',
        question: 'Some changes have not been added to Selection. If you leave now, you will lose these changes.',
        buttonName: 'Leave anyway'
      }
    })
    return dialogRef.afterClosed().pipe(
      switchMap(exit => {
        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof exit === 'undefined') {
          return of(false);
        }
        return of(exit)
      })
    )
  }

  applyFilters() {
    if (this.availsForm.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return;
    }

    // Territories that are already sold after form filtering
    const soldTerms = getSoldTerms(this.availsForm.value, this.salesTerms);
    const sold = soldTerms.map(term => term.territories
      .filter(t => !!territoriesISOA3[t])
      .map(territory => toTerritoryMarker(territory, term.contractId, this.mandates))
    ).flat();
    this.sold$.next(sold);

  }

  clear() {
    this.availsForm.reset();
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    this.bucketForm.toggleTerritory(this.availsForm.value, territory);
  }

  public selectAll() {
    this.available$.toPromise().then(available => {
      available.forEach(t => {
        const isAlreadyToggled = this.bucketForm.isAlreadyToggled(this.availsForm.value, t);
        if (!isAlreadyToggled) {
          this.bucketForm.toggleTerritory(this.availsForm.value, t);
        }
      });
    });
  }

  public trackByTag(tag) {
    return tag;
  }

  /** Display the territories information in the tooltip */
  public displayTerritoryTooltip(territory: TerritoryValue, status: string) {
    this.hoveredTerritory = { name: territory, status }
  }

  /** Clear the territories information */
  public clearTerritoryTooltip() {
    this.hoveredTerritory = null;
  }

  addToSelection() {
    this.bucketService.update(this.orgId, this.bucketForm.value);
  }

  toggleCalendar(toggle: MatSlideToggleChange) {
    this.isCalendar = toggle.checked;
  }
  
  explain() {
    this.dialog.open(ExplanationComponent, {
      height: '80vh',
      width: '80vw'
    });
  }
}
