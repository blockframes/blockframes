import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieQuery, Movie, createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { TerritoryValue, TerritoryISOA3Value, territoriesISOA3, territories, Language } from '@blockframes/utils/static-model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { getMandateTerms, getSoldTerms } from '@blockframes/contract/avails/avails';
import { Term, TermService } from '@blockframes/contract/term/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bucket, BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';
import { BucketTermForm, BucketForm } from '@blockframes/contract/bucket/form';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { switchMap } from 'rxjs/operators';

interface TerritoryMarker {
  isoA3: TerritoryISOA3Value,
  label: TerritoryValue
  contract?: Contract,
}

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
  public bucket$: Observable<Bucket>;
  public periods = ['weeks', 'months' ,'years'];
  private sub: Subscription;

  /** List of world map territories */
  available$ = new BehaviorSubject<TerritoryMarker[]>([]);
  sold$ = new BehaviorSubject<TerritoryMarker[]>([]);
  selected$ = new BehaviorSubject<TerritoryMarker[]>([]); // The one in the bucket form

  private mandates: Contract[];
  private sales: Contract[];
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
  public availsForm = new AvailsForm({}, ['duration']);
  public terms$ = this.bucketForm.selectTerms(this.movie.id);

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

    this.mandates = contracts.filter(c => c.type === 'mandate');
    this.sales = contracts.filter(c => c.type === 'sale');

    this.mandateTerms = await this.termService.getValue(this.mandates.map(m => m.termIds).flat());
    this.salesTerms = await this.termService.getValue(this.sales.map(m => m.termIds).flat());
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

    // Territories available after form filtering
    const mandateTerms = getMandateTerms(this.availsForm.value, this.mandateTerms);
    const available: TerritoryMarker[] = mandateTerms.map(term => term.territories
      .filter(t => !!territoriesISOA3[t])
      .map(territory => ({
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
        contract: this.mandates.find(m => m.id === term.contractId)
      }))
    ).flat();
    this.available$.next(available);

    // Territories that are already sold after form filtering
    const soldTerms = getSoldTerms(this.availsForm.value, this.salesTerms);
    const sold = soldTerms.map(term => term.territories
      .filter(t => !!territoriesISOA3[t])
      .map(territory => ({
        isoA3: territoriesISOA3[territory],
        label: territories[territory],
        contract: this.mandates.find(m => m.id === term.contractId)
      }))
    ).flat();
    this.sold$.next(sold);

  }

  clear() {
    this.availsForm.reset();
    this.selected$.next([]);
    this.available$.next([]);
  }

  /** Whenever you click on a territory, add it to availsForm.territories. */
  public select(territory: TerritoryMarker) {
    const selected = this.selected$.getValue();
    const available = this.available$.getValue();

    if (selected.find(s => s.isoA3 === territory.isoA3)) {
      // Add back territory to available layer and remove territory from seletion
      this.selected$.next(selected.filter(s => s.isoA3 !== territory.isoA3));
      available.push(territory);
      this.available$.next(available);
    } else {
      // Add territory to selection and remove it from available
      this.available$.next(available.filter(s => s.isoA3 !== territory.isoA3))
      selected.push(territory);
      this.selected$.next(selected);
    }
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

  addLanguage(term: BucketTermForm) {
    const spec = createMovieLanguageSpecification({});
    term.controls.languages.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(term: BucketTermForm, language: Language) {
    term.controls.languages.removeControl(language);
  }

  addToSelection() {
    this.bucketService.update(this.orgId, this.bucketForm.value);
  }
}
