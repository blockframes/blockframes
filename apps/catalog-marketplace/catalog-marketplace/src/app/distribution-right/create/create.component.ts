import { MatAutocompleteSelectedEvent } from '@angular/material';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DistributionRightForm } from './create.form';
import { staticModels } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { startWith, debounceTime } from 'rxjs/operators';
import { MovieTerritories } from '../../pages/marketplace-search/marketplace-search.form';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class DistributionRightCreateComponent implements OnInit {
  // Basic
  public form = new DistributionRightForm();

  // Medias
  public movieMedias: string[];

  // Territories
  public movieTerritories: string[];
  public territoriesFilter: Observable<string[]>;
  public selectedMovieTerritories: string[] = [];
  public territoriesControl: FormControl = new FormControl();
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit() {
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
    // this.form.removeTerritory(index);
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
}
