import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MovieStore, MovieQuery, MovieService, createMovie, Movie } from '../+state';
import { MatChipInputEvent, MatSnackBar } from '@angular/material';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router } from '@angular/router';
import { AuthQuery, User } from '@blockframes/auth';
import staticModels from '../staticModels.json';
import { OrganizationQuery, Organization } from '@blockframes/organization';

@Component({
  selector: 'movie-financing-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit, OnDestroy {
  public staticModels: any;
  public credits: FormArray;
  public stakeholders: FormArray;
  public promotionalElements: FormArray;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public persistForm: PersistNgFormPlugin;
  public movieForm: FormGroup;
  private isModifying = false;
  private activeId: string;
  public user: User;
  public org: Organization;
  public movie: Movie;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: MovieStore,
    private auth: AuthQuery,
    public orgQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.user = this.auth.user;
    this.staticModels = staticModels;
    this.org = this.orgQuery.getActive();
    this.movie = this.query.getActive();
    console.log(this.movie);

    this.movieForm = this.builder.group({
      title: [''],
      ipId: [''],
      credits: this.builder.array([ this.createCredit() ]),
      stakeholders: this.builder.array([ this.createStakeholder(this.org.id, this.org.name, 'ADMIN', 'Producer', 'canActivateDelivery') ]),
      genres: [''],
      isan: [null],
      status: [''],
      poster: [''],
      types: [''],
      keywords: this.builder.array([ this.createKeyword('') ]),
      logline: ['', Validators.maxLength(180)],
      synopsis: ['', Validators.maxLength(500)],
      directorNote: ['', Validators.maxLength(1000)],
      producerNote: ['', Validators.maxLength(1000)],
      originCountry: [''],
      languages: [''],
      promotionalElements: this.builder.array([ this.createPromotionalElement() ]),
      goalBudget: [null],
      movieCurrency: [''],
      fundedBudget: [null],
      breakeven: [null],
      backendProfit: [null],
      potentialRevenues: [null],
      selectionCategories: ['']
    });
    // Akita Persist Form
    this.persistForm = new PersistNgFormPlugin(this.query, createMovie).setForm(this.movieForm);

    /*
    MODIFICATION OF A MOVIE
    In case of modification of an existing movie,
    load the form with current data stored in the active Movie.
    */
    if(this.query.hasActive()) {
      this.isModifying = true;
      this.activeId = this.query.getActiveId();
      this.movieForm.patchValue(createMovie(this.query.getActive()));
    }

    console.log(this.movieStakeholders.getRawValue());
  }

  /*
  MODIFICATION OF A MOVIE
  Kill the active Movie to reset the modification process.
  */
  ngOnDestroy() {
    this.store.setActive(null);
    this.clear();
    this.persistForm.destroy();
    this.isModifying = false;
  }

// ACTIONS

  /*
  SAVING THE FORM
  Case 1 = invalid form refused.
  Case 2 = modification of a Movie.
  Case 3 = new Movie.
  */
  public onSubmit(){
    if(!this.movieForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    }
    if(this.isModifying){
      this.snackBar.open(`Modified ${this.movieForm.get('title').value}`, 'close', {duration: 2000});
      this.service.update(this.activeId, this.movieForm.value);
    } else {
      this.snackBar.open(`Created ${this.movieForm.get('title').value}`, 'close', {duration: 2000});
      this.service.add(this.movieForm.value);
    }
    this.router.navigateByUrl('');
    this.clear();
  }

  public clear() {
    this.persistForm.reset();
    this.movieForm.reset();
  }

  public cancel() {
    this.clear();
    this.router.navigateByUrl('');
  }

// POSTER

  public addPoster(poster: string) {
    this.movieForm.patchValue({poster});
  }
  // TODO: rezise and rename


  /*
  FormArray parts of the FormGroup with same methods
  */
// CREDITS

  public get movieCredits() {
    return this.movieForm.get('credits') as FormArray;
  }

  public createCredit(): FormGroup {
    return this.builder.group({
      firstName: '',
      lastName: '',
      creditRole: '',
    });
  }

  public addCredit(): void {
    this.movieCredits.push(this.createCredit());
  }

  public removeCredit(index: number): void {
    this.movieCredits.removeAt(index);
  }

// STAKEHOLDERS

  public get movieStakeholders() {
    return this.movieForm.get('stakeholders') as FormArray;
  }


  public createStakeholder(orgId: string, orgName: string, orgMovieRole: string, stakeholderRole: string, stakeholderAuthorization: string): FormGroup {
    return this.builder.group({
      orgId: orgId,
      orgName: orgName,
      orgMovieRole: orgMovieRole,
      stakeholderRole: stakeholderRole,
      stakeholderAuthorization: stakeholderAuthorization,
    });
  }

  public addStakeholder(orgId: string, orgName: string, orgMovieRole: string, stakeholderRole: string, stakeholderAuthorization: string): void {
    this.movieStakeholders.push(this.createStakeholder(orgId, orgName, orgMovieRole, stakeholderRole, stakeholderAuthorization));
  }

  public removeStakeholder(index: number): void {
    this.movieStakeholders.removeAt(index);
  }

// KEYWORDS

  public get keywords() {
    return this.movieForm.get('keywords') as FormArray;
  }

  public createKeyword(keywordName: string): FormGroup {
    return this.builder.group({name: keywordName});
  }

  public addKeyword(keywordName: string): void {
    this.keywords.push(this.createKeyword(keywordName));
  }

  public addChipKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add keyword
    if ((value || '').trim()) {
      this.addKeyword(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public remove(index: number): void {
    this.keywords.removeAt(index);
  }

// PROMOTIONAL ELEMENTS: not implemented yet

  public createPromotionalElement(): FormGroup {
    return this.builder.group({
      promotionalElementName: '',
      url: '',
    });
  }

  public addPromotionalElement(): void {
    this.promotionalElements = this.movieForm.get('promotionalElements') as FormArray;
    this.promotionalElements.push(this.createPromotionalElement());
  }



}
