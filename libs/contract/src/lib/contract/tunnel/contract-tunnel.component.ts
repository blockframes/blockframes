import { Router, ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TunnelStep, TunnelConfirmComponent } from '@blockframes/ui/tunnel'
import { ContractForm } from '../form/contract.form';
import { ContractQuery, ContractService, ContractType, createContract, TitlesAndRights } from '../+state';
import { MatDialog } from '@angular/material/dialog';
import { DistributionRightForm } from '@blockframes/distribution-rights/form/distribution-right.form';
import { FormEntity, FormList } from '@blockframes/utils/form/forms';
import { ContractTitleDetailForm } from '@blockframes/contract/version/form';
import { DistributionRightService, DistributionRight, createDistributionRight } from '@blockframes/distribution-rights/+state';
import { startWith, map, switchMap, shareReplay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
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
      path: movie.id, label: movie.title.international
    }))
  }, {
    ...steps[1]
  }]
}

export type RightControls = Record<string, FormList<DistributionRight, DistributionRightForm>>;

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTunnelComponent implements OnInit {
  /** Keep track of the rights removed */
  private removedRights: Record<string, string[]> = {};
  public steps$: Observable<TunnelStep[]>;
  public type: ContractType;
  public exitRoute$: Observable<string>;

  public movies$: Observable<Movie[]>;
  public rightForms = new FormEntity<RightControls>({});
  public contractForm: ContractForm;

  constructor(
    private orgQuery: OrganizationQuery,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private query: ContractQuery,
    private movieService: MovieService,
    private rightService: DistributionRightService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
  ) { }

  async ngOnInit() {
    const contract = this.query.getActive();
    this.type = contract.type;
    this.contractForm = new ContractForm(contract);

    // Set the initial rights
    Object.keys(contract.lastVersion.titles).forEach(async movieId => {
      const rights = await this.rightService.getContractDistributionRights(contract.id, movieId);
      this.rightForms.setControl(movieId, FormList.factory(rights, right => new DistributionRightForm(right)));
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
        return `../../../../rights/${value.get('contractId')}`;
      } else {
        return `../../../../../rights/${value.get('contractId')}`;
      }
    }))
  }

  /** Add a title to this contract */
  addTitle(movieId: string, mandate?: boolean) {
    this.contractForm
      .get('lastVersion')
      .get('titles')
      .setControl(movieId, new ContractTitleDetailForm(mandate ? { price: { amount: 0 } } : {}));
    this.rightForms.setControl(movieId, FormList.factory([], right => new DistributionRightForm(right)));
  }

  /**
   * Removes a title from the contract form
   * @param movieId
   * @param isExploitRight
   */
  removeTitle(movieId: string, isExploitRight?: boolean) {
    this.contractForm.get('lastVersion').get('titles').removeControl(movieId);
    const rights = this.rightForms.get(movieId).value;
    // start from the end to remove to avoid shift effects
    for (let i = rights.length - 1; i >= 0; i--) {
      this.removeRight(movieId, i);
    }
    // if we are in exploitation rights section of the tunnel
    // we want to go to the next movie
    if (isExploitRight) {
      this.rightForms.removeControl(movieId);
      const rightIds = Object.keys(this.rightForms.controls)
      if (!rightIds.length) {
        this.router.navigate(['details'], { relativeTo: this.route })
      } else {
        this.router.navigate([rightIds[rightIds.length - 1]], { relativeTo: this.route })
      }
    }
  }

  /** Add a right to a title */
  addRight(movieId: string) {
    this.rightForms.get(movieId).add();
  }

  /** Remove a right from a title */
  removeRight(movieId: string, index: number) {
    const right = this.rightForms.get(movieId).at(index).value;
    if (right.id) {
      this.removedRights[movieId]
        ? this.removedRights[movieId].push(right.id)
        : this.removedRights[movieId] = [right.id];
    }
    this.rightForms.get(movieId).removeAt(index);
  }

  /**
   * Save Contract, Contract Version and rights
   * @dev At this point, rights may already exists
   * (ie: created when clicked on "create an offer" from selection page).
   * but rights may have been edited, added or removed and the contract may
   * have changed too in the contract tunnel form.
   */
  public async save() {

    const orgId = this.orgQuery.getActiveId();
    const titlesAndRights = {} as TitlesAndRights;

    for (const movieId in this.rightForms.controls) {
      const rights = this.rightForms.get(movieId).value.map(right => createDistributionRight(right));
      titlesAndRights[movieId] = rights;
    }

    const contract = createContract({
      ...this.query.getActive(),
      ...this.contractForm.value
    });

    await this.contractService.createContractAndRight(orgId, titlesAndRights, contract);

    // Remove rights
    const write = this.db.firestore.batch();
    for (const movieId in this.removedRights) {
      for (const rightId of this.removedRights[movieId]) {
        this.rightService.remove(rightId, { params: { movieId }, write })
      }
    }
    this.removedRights = {};
    await write.commit();

    this.contractForm.markAsPristine();
    this.rightForms.markAsPristine();
    await this.snackBar.open('Saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    if (this.contractForm.pristine && this.rightForms.pristine) {
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
