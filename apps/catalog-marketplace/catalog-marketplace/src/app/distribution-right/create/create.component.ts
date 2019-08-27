<<<<<<< HEAD
import { MovieQuery } from '@blockframes/movie/movie/+state';
=======
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DistributionRightForm } from './create.form';
<<<<<<< HEAD
import { staticModels, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { startWith, debounceTime } from 'rxjs/operators';
=======
import { staticModels } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { startWith, debounceTime } from 'rxjs/operators';
import { MovieTerritories } from '../../pages/marketplace-search/marketplace-search.form';
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class DistributionRightCreateComponent implements OnInit {
  // Basic
  public form = new DistributionRightForm();
  public movie$: Observable<Movie>;

  // Medias
  public movieMedias: string[];
<<<<<<< HEAD

  // Territories
  public movieTerritories: string[];
  public territoriesFilter: Observable<string[]>;
  public selectedMovieTerritories: string[] = [];
  public territoriesControl: FormControl = new FormControl();
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(private query: MovieQuery) {}

  ngOnInit() {
    this.movie$ = this.query.selectActive();
    this.movie$.subscribe(console.log)
    // Get the available territories on this movie
    this.movie$.subscribe(territories => this.movieTerritories = territories.salesAgentDeal.territories);
=======

  // Territories
  public movieTerritories: string[];
  public territoriesFilter: Observable<string[]>;
  public selectedMovieTerritories: string[] = [];
  public territoriesControl: FormControl = new FormControl();
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit() {
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f
    this.movieTerritories = staticModels['TERRITORIES'].map(key => key.label);
    this.territoriesFilter = this.territoriesControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(territory => this._territoriesFilter(territory))
    );
  }

  /////////////////
  // Territories //
  /////////////////

  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return this.movieTerritories.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  public removeTerritory(territory: string, index: number) {
    const i = this.selectedMovieTerritories.indexOf(territory);

    if (i >= 0) {
      this.selectedMovieTerritories.splice(i, 1);
    }
<<<<<<< HEAD
    // this.form.removeTerritory(index);ging branches
=======
    // this.form.removeTerritory(index);
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f
  }

  public hasTerritory(territory: string) {
    this.form.get('territories');
  }

  public selectedTerritory(territory: MatAutocompleteSelectedEvent) {
    if (!this.selectedMovieTerritories.includes(territory.option.viewValue)) {
      this.selectedMovieTerritories.push(territory.option.value);
    }
    // this.filterForm.addTerritory(territory.option.viewValue as MovieTerritories);
    this.territoryInput.nativeElement.value = '';
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f
