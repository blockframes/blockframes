import { EntityControl, StringControl, YearControl, FormEntity, UrlControl } from '@blockframes/utils';
import { Validators, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { Injectable } from '@angular/core';
import { Movie } from '../../+state/movie.model';


function createMovieControls() {

  return {

    // @todo WIP SECTIONS
    logline:  new StringControl('', false, [Validators.maxLength(180)]),
    synopsis: new StringControl('', false, [Validators.maxLength(500)]),
    keywords: new FormArray([]),
    credits: new FormArray([]),
    images: new FormArray([]),
    promotionalElements: new FormArray([]),

    ////////////
    /// SECTIONS
    ////////////

    // MAIN SECTION
    
    main: new FormEntity<Movie['main']>({
      internalRef : new StringControl(''),
      title: new FormEntity<Movie['main']['title']>({
        original: new StringControl(''),
        international: new StringControl(''),
      }),
      directors: new FormArray([]),
      poster: new StringControl(''),
      productionYear: new YearControl(''),
      genres:  new StringControl(''), 
      originCountry:  new StringControl(''),
      languages:  new StringControl(''),
      status:  new StringControl('', false, [Validators.required]),
    }),
  }
}

type MovieControl = ReturnType<typeof createMovieControls>

@Injectable({ providedIn: 'root' })
export class MovieForm extends FormEntity<Partial<Movie>, MovieControl> {
  protected builder : FormBuilder;
  constructor() {
    super(createMovieControls());
    this.builder = new FormBuilder;
  }

  //////////
  // GETTERS
  //////////

  /* Getters for all form inputs */
  public currentFormValue(attr: Extract<keyof Movie, string>, index?: number) {
    if (index !== undefined) {
      const formArray = this.get(attr) as FormArray;
      return formArray.controls[index] !== null ? formArray.controls[index].value : '' as String;
    } else {
      const input = this.get(attr) as FormControl;
      return input !== null ? input.value: '' as String;
    }
  }

  public get keywords() {
    return this.get('keywords') as FormArray;
  }

  public get movieCredits() {
    return this.get('credits') as FormArray;
  }

  public get promotionalElements() {
    return this.get('promotionalElements') as FormArray;
  }

  public get images() {
    return this.get('images') as FormArray;
  }

  //////////
  // UTILS
  //////////

  public populate(movie: Movie) {

    // Common fields

    this.get('logline').setValue(movie.logline);
    this.get('synopsis').setValue(movie.synopsis);

    // SECTION
    const mainSection = this.get('main');
    mainSection.get('internalRef').setValue(movie.main.internalRef);
    mainSection.get('title').get('original').setValue(movie.main.title.original);
    mainSection.get('title').get('international').setValue(movie.main.title.international);
    mainSection.get('poster').setValue(movie.main.poster);
    mainSection.get('productionYear').setValue(movie.main.internalRef);
    mainSection.get('genres').setValue(movie.main.genres);
    mainSection.get('originCountry').setValue(movie.main.originCountry);
    mainSection.get('languages').setValue(movie.main.languages);
    mainSection.get('status').setValue(movie.main.status);

    if (movie.main.directors && movie.main.directors.length) {
      movie.main.directors.forEach((director) => {
        (mainSection.get('directors') as FormArray).push(this.builder.group(director))
      })
    }

    // Populate custom fields
    if (movie.keywords && movie.keywords.length) {
      movie.keywords.forEach((keyword) => {
        this.addFormControl(new FormControl(keyword), 'keywords');
      })
    }

    if (movie.credits && movie.credits.length) {
      movie.credits.forEach((credit) => {
        this.addFormControl(this.builder.group(credit), 'movieCredits');
      })
    }

    if (movie.images && movie.images.length) {
      movie.images.forEach((image) => {
        this.addFormControl(new FormControl(image), 'images');
      })
    }

    if (movie.promotionalElements && movie.promotionalElements.length) {
      movie.promotionalElements.forEach((element) => {
        this.addFormControl(this.builder.group(element), 'promotionalElements');
      })
    }
  }

  public addFormControl(value: FormControl | FormGroup, key: string): void {
    this[key].push(value);
  }

  // @todo remove
  public removeFormControl(index: number, key: string): void {
    this[key].removeAt(index);
  }

  public setImage(image: string, index: number): void {
    this.images.controls[index].setValue(image);
  }

  public addImage(): void {
    this.addFormControl(new FormControl(''), 'images');
  }

  public addPromotionalElement(): void {
    const control = new FormGroup({
      label: new StringControl(''),
      url: new UrlControl('')
    })
    this.addFormControl(control, 'promotionalElements')
  }

  public addChip(event: MatChipInputEvent, object: string): void {
    const input = event.input;
    const value = event.value;

    // Add keyword
    if ((value || '').trim()) {
      this.addFormControl(new FormControl(value.trim()), object);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  reset(value?: EntityControl<Movie>, options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
  }): void {
    super.reset(value, options);
    this.clearFormArrays();
  }

  /*
  * Clear controls that are FormArrays because form.reset() only set values to null.
  * For more information @see: https://github.com/angular/angular/issues/31110
  */
  protected clearFormArrays() {
    Object.keys(this.controls).forEach((key: string) => {
      const abstractControl = this.controls[key];
      if (abstractControl instanceof FormArray) {
        abstractControl.clear();
      }
    });
  }
}
