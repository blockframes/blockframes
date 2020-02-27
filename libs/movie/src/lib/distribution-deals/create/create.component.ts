import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Movie, MovieQuery } from '../../movie/+state';
import {
  MEDIAS_SLUG,
  MediasSlug,
  TERRITORIES_SLUG,
  TerritoriesSlug,
  LanguagesSlug,
  LANGUAGES_SLUG,
  LanguagesLabel,
} from '@blockframes/utils/static-model/types';
import { DateRange } from '@blockframes/utils/common-interfaces/range';
import { ControlErrorStateMatcher, languageValidator } from '@blockframes/utils';
import {
  getDealsInDateRange,
  exclusiveDistributionDeals,
  salesAgentHasDateRange,
  getFilterMatchingDeals
} from './availabilities.util';
import { DistributionDealForm } from './create.form';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { createDistributionDeal } from '../+state/distribution-deal.model';
import { DistributionDealService } from '../+state';
import { createContractPartyDetail, initContractWithVersion } from '@blockframes/contract/contract/+state/contract.model';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

enum ResearchSteps {
  START = 'Start',
  ERROR = 'ERROR',
  POSSIBLE = 'POSSBILE'
}

@Component({
  selector: 'distribution-deal-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealCreateComponent implements OnInit, OnDestroy {

  // Enum for tracking the current research state
  public steps = ResearchSteps;
  public step: ResearchSteps = this.steps.START;

  // Subscription for the results in the research form
  private researchSubscription: Subscription;

  // Form for holding users distribution rights choice
  public form = new DistributionDealForm();

  // Movie for information to display
  public movie$: Observable<Movie>;

  /**
   * This variable will be input the dates inside of the datepicker
   * if the users types it in manually
   */
  public choosenDateRange: DateRange = { to: new Date(), from: new Date() };

  // This variable contains the dates which the movie is already bought
  public occupiedDateRanges: DateRange[] = [];

  // Error state matcher
  public matcher = new ControlErrorStateMatcher();

  // Available movie medias
  public movieMedia: MediasSlug[] = MEDIAS_SLUG;

  // Available movie languages
  public movieLanguages: LanguagesSlug[] = LANGUAGES_SLUG;

  // Available movie territories
  public movieTerritories: TerritoriesSlug[] = TERRITORIES_SLUG;

  // Filters section
  public languagesFilter: Observable<string[]>;
  public territoriesFilter: Observable<string[]>;

  // Helper controls
  public languageControl = new FormControl('', languageValidator);
  public territoryControl: FormControl = new FormControl();
  public languages$ = this.form.valueChanges.pipe(
    startWith(this.form.value),
    map(({ languages }) => Object.keys(languages))
  );

  @ViewChild('territoryInput') territoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('languageInput') languageInput: ElementRef<HTMLInputElement>;

  constructor(
    private query: MovieQuery,
    private router: Router,
    private organizationQuery: OrganizationQuery,
    private distributionDealService: DistributionDealService,
    private contractService: ContractService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // The movie$ observable will get unsubscribed by the async pipe
    this.movie$ = this.query.selectActive();
    this.territoriesFilter = this.territoryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(territory => this._territoriesFilter(territory))
    );
    this.languagesFilter = this.languageControl.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      map(value => this._languageFilter(value))
    );
    this.researchSubscription = this.subscribeOnSearchForm();
  }

  private get movie(): Movie {
    return this.query.getActive();
  }

  /////////////////////
  // Filter section //
  ////////////////////

  private _languageFilter(value: string): string[] {
    return this.movieLanguages.filter(language =>
      language.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _territoriesFilter(territory: string): string[] {
    return this.movieTerritories.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(territory.toLowerCase());
    });
  }

  ///////////////////
  // Form section //
  //////////////////

  public changeDateFocus(dates: DateRange) {
    this.choosenDateRange.to = dates.to;
    this.choosenDateRange.from = dates.from;
  }

  public selectedTerritory(territory: MatAutocompleteSelectedEvent) {
    this.form.addTerritory(getCodeIfExists('TERRITORIES', territory.option.viewValue as ExtractCode<'TERRITORIES'>));
    this.territoryInput.nativeElement.value = '';
  }

  public removeTerritory(index: number) {
    this.form.removeTerritory(index);
  }

  public setWantedRange(date: DateRange) {
    this.form.get('duration').setValue({ to: date.to, from: date.from });
  }

  public checkMedia(media: MediasSlug) {
    this.form.checkMedia(media);
  }

  public addLanguage(language: LanguagesLabel) {
    this.form.addLanguage(getCodeIfExists('LANGUAGES', language), this.movie.main);
    this.languageInput.nativeElement.value = '';
  }

  public removeLanguage(language: LanguagesSlug) {
    this.form.removeLanguage(language);
  }

  public async addDistributionDeal() {
    const distributionDeal = createDistributionDeal();
    // Create the contract that will handle the deal
    const contract = initContractWithVersion();

    const licensee = createContractPartyDetail();
    licensee.party.orgId = this.organizationQuery.getActiveId();
    licensee.party.role = 'licensee';
    contract.doc.parties.push(licensee);

    const licensor = createContractPartyDetail();
    licensor.party.orgId = this.movie.salesAgentDeal.salesAgent.orgId;
    licensor.party.displayName = this.movie.salesAgentDeal.salesAgent.displayName;
    licensor.party.role = 'licensor';
    contract.doc.parties.push(licensor);

    const isValid = await this.contractService.isContractValid(contract.doc)

    if (!isValid) {
      this.snackBar.open(`Error while creating contract..`, 'close', { duration: 2000 });
    } else {
      const dealId = await this.distributionDealService.addDistributionDeal(this.movie.id, distributionDeal, contract);
      await this.cartService.addDealToCart(dealId, 'default');
      this.snackBar.open(`Distribution deal saved. Redirecting ...`, 'close', { duration: 2000 });
      this.router.navigateByUrl(`c/o/catalog/selection/overview`);
    }

  }

  //////////////////////
  // Research section //
  //////////////////////

  public startResearch() {
    console.log('todo #1022');
  }

  public subscribeOnSearchForm(): Subscription {
    /**
     * If the customer once hit the search button. We want to listen on the changes
     * he is going to make. That will give us the chance to render the hint/error message
     * in real time. But for that he needs to fill every part of the survey once.
     */
    return this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        tap(async value => {
          //////////////////
          // FORM VALIDATION
          //////////////////

          if (!this.form.valid) {
            console.log('Waiting for the form to be filled');
            return false;
          }

          /////////////////////
          // SALES AGENT CHECKS
          /////////////////////

          // If isSpecifiedDateRangeInSalesAgentDateRange resolves as false, the sales agent doesn't provide this wanted date range
          const isSpecifiedDateRangeInSalesAgentDateRange: boolean = salesAgentHasDateRange(
            this.movie.salesAgentDeal.rights,
            value.duration
          );
          if (!isSpecifiedDateRangeInSalesAgentDateRange) {
            this.step = this.steps.ERROR;
            console.log(
              `There is no sales agent provided in that date range. ${value.duration.from.getDate()} - ${value.duration.to.getDate()}`
            );
            return false; // End of process
          }

          // Do we have territories or medias from search that are not in sales agent scope ?
          const territoriesNotInSalesAgentScope = [];
          value.territories.forEach(territory => {
            if (!this.movie.salesAgentDeal.territories.includes(territory)) {
              territoriesNotInSalesAgentScope.push(territory);
            }
          });

          const mediasNotInSalesAgentScope = [];
          value.medias.forEach(media => {
            if (!this.movie.salesAgentDeal.medias.includes(media)) {
              mediasNotInSalesAgentScope.push(media);
            }
          });

          if (mediasNotInSalesAgentScope.length || territoriesNotInSalesAgentScope.length) {
            // @todo #1036 let customer make a request to sales agent ( to see if he can adapt and find a solution)
            console.log(
              'Some territories or medias are not in sales agent scope',
              territoriesNotInSalesAgentScope,
              mediasNotInSalesAgentScope
            );
            return false; // End of process
          }

          ///////////////
          // SALES CHECKS
          ///////////////

          // Do we have others distribution deals overrlapping current daterange ?
          const deals = await this.distributionDealService.getValue();
          const dealsInDateRange = getDealsInDateRange(value.duration, deals);
          if (dealsInDateRange.length === 0) {
            // We have no intersection with other deals, so we are OK !
            console.log('YOU CAN BUY YOUR DIST RIGHT, NO INTERSECTION FOUND');
            this.step = this.steps.POSSIBLE;
            return true; // End of process
          }

          // We have territories and medias in common with some existing distribution deals,
          // Lets check if territories and medias in common belongs to the same deals and if those deals are exclusives.
          const dealsWithMediasTerritoriesAndLanguagesInCommon = getFilterMatchingDeals(value, dealsInDateRange);

          if (dealsWithMediasTerritoriesAndLanguagesInCommon.length) {
            const exclusiveSalesWithMediasAndTerritoriesInCommon = exclusiveDistributionDeals(
              dealsWithMediasTerritoriesAndLanguagesInCommon
            );
            if (exclusiveSalesWithMediasAndTerritoriesInCommon.length) {
              console.log(
                'There is some exclusive deals blocking your request :',
                exclusiveSalesWithMediasAndTerritoriesInCommon
              );
              return false; // End of process
            } else {
              if (value.exclusive) {
                console.log(
                  'There is some deals blocking your exclusivity request :',
                  dealsWithMediasTerritoriesAndLanguagesInCommon
                );
                return false; // End of process
              } else {
                console.log('YOU CAN BUY YOUR DIST RIGHT, since you do not require exclusivity');
                this.step = this.steps.POSSIBLE;
                return true; // End of process
              }
            }
          } else {
            // There is no deals with territories AND medias in common, we are OK.
            console.log('YOU CAN BUY YOUR DIST RIGHT, NO MEDIAS, TERRITORIES AND LANGUAGES OVERLAPPINGS FOUND');
            this.step = this.steps.POSSIBLE;
            return true; // End of process
          }

          // @TODO#1022
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.researchSubscription.unsubscribe();
  }
}
