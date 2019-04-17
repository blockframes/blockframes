import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createMovie, Movie, MovieQuery, MovieService, MovieStore } from '../+state';
import { MatChipInputEvent, MatSnackBar } from '@angular/material';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router } from '@angular/router';
import { AuthQuery, User } from '@blockframes/auth';
import { default as staticModels } from '../staticModels';
import { Organization, OrganizationQuery } from '@blockframes/organization';

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
  public user: User;
  public org: Organization;
  public movie: Movie;
  private isModifying = false;
  private activeId: string;
  public fullScreenForm = 'hide';
  
  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private builder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: MovieStore,
    private auth: AuthQuery,
    public orgQuery: OrganizationQuery
  ) {
  }

  // getter for all form inputs
  public currentFormValue(attr) {
    const input = this.movieForm.get(attr);
    return input !== null ? input.value: '' as String;
  }

  public get movieCredits() {
    return this.movieForm.get('credits') as FormArray;
  }

  public get movieStakeholders() {
    return this.movieForm.get('stakeholders') as FormArray;
  }

// ACTIONS

  public get keywords() {
    return this.movieForm.get('keywords') as FormArray;
  }

  ngOnInit() {
    this.user = this.auth.user;
    this.staticModels = staticModels;
    this.org = this.orgQuery.getActive();
    this.movie = this.query.getActive();

    this.movieForm = this.builder.group({
      original_title: [this.movie.title.original],
      international_title: [this.movie.title.international],
      director_name: [this.movie.directorName],
      production_year: [this.movie.productionYear],
      ipId: [''],
      credits: this.builder.array([this.createCredit()]),
      stakeholders: this.builder.array([this.createStakeholder()]),
      genres: [''],
      isan: [null],
      status: [''],
      poster: [this.movie.poster],
      types: [''],
      keywords: this.builder.array([this.createKeyword('')]),
      logline: ['', Validators.maxLength(180)],
      synopsis: ['', Validators.maxLength(500)],
      directorNote: ['', Validators.maxLength(1000)],
      producerNote: ['', Validators.maxLength(1000)],
      originCountry: [''],
      languages: [''],
      promotionalElements: this.builder.array([this.createPromotionalElement()]),
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
    if (this.query.hasActive()) {
      this.activeId = this.query.getActiveId();
      this.movieForm.patchValue(createMovie(this.query.getActive()));
    }

  }

  /*
  MODIFICATION OF A MOVIE
  Kill the active Movie to reset the modification process.
  */
  ngOnDestroy() {
    this.clear();
    this.persistForm.destroy();
    this.isModifying = false;
  }

// POSTER

  /*
  SAVING THE FORM
  Case 1 = invalid form refused.
  Case 2 = modification of a Movie.
  Case 3 = new Movie.
  */
  public onSubmit() {
    if (!this.movieForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    } else {
      this.snackBar.open(`${this.movieForm.get('original_title').value} saved.`, 'close', { duration: 2000 });
      this.service.update(this.activeId, this.preUpdate({ ...this.movieForm.value }));
    }

    //this.router.navigateByUrl(''); @todo remove ?
    //this.clear(); @todo remove ?
  }

  // @todo temp until corrected camelCase FormBuilderAttribs
  private preUpdate(movie: any) {
    // apply movie modifications to fit actual model
    movie.title = {};
    if (movie.original_title) {
      movie.title.original = movie.original_title;
    }

    if (movie.international_title) {
      movie.title.international = movie.international_title;
    }

    if (movie.director_name) {
      movie.directorName = movie.director_name;
      
    }

    if (movie.production_year) {
      movie.productionYear = movie.production_year;
    }

    delete movie.original_title;
    delete movie.international_title;
    delete movie.director_name;
    delete movie.production_year;

    return movie;
  }

  // TODO: rezise and rename


  /*
  FormArray parts of the FormGroup with same methods
  */

// CREDITS

  public clear() {
    this.persistForm.reset();
    this.movieForm.reset();
  }

  public cancel() {
    this.clear();
    this.router.navigateByUrl('');
  }

  public addPoster(poster: string) {
    this.movieForm.patchValue({ poster });
  }

  public removePoster() {
    this.movieForm.patchValue({ poster : '' });
  }

  public createCredit(): FormGroup {
    return this.builder.group({
      firstName: '',
      lastName: '',
      creditRole: ''
    });
  }

// STAKEHOLDERS

  public addCredit(): void {
    this.movieCredits.push(this.createCredit());
  }

  public removeCredit(index: number): void {
    this.movieCredits.removeAt(index);
  }

  public createStakeholder(orgId?: string, orgName?: string, orgMovieRole?: string, stakeholderRole?: string, stakeholderAuthorization?: string): FormGroup {
    return this.builder.group({
      orgId: orgId || '',
      orgName: orgName || '',
      orgMovieRole: orgMovieRole || '',
      stakeholderRole: stakeholderRole || '',
      stakeholderAuthorization: stakeholderAuthorization || ''
    });
  }

  public addStakeholder(orgId: string, orgName: string, orgMovieRole: string, stakeholderRole: string, stakeholderAuthorization: string): void {
    this.movieStakeholders.push(this.createStakeholder(orgId, orgName, orgMovieRole, stakeholderRole, stakeholderAuthorization));
  }

// KEYWORDS

  public removeStakeholder(index: number): void {
    this.movieStakeholders.removeAt(index);
  }

  public createKeyword(keywordName: string): FormGroup {
    return this.builder.group({ name: keywordName });
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
      url: ''
    });
  }

  public addPromotionalElement(): void {
    this.promotionalElements = this.movieForm.get('promotionalElements') as FormArray;
    this.promotionalElements.push(this.createPromotionalElement());
  }


  public toggleFullScreen() {
    if (this.fullScreenForm === 'show') {
      this.fullScreenForm = 'hide';
    } else {
      this.fullScreenForm = 'show';
    }
  }
}
