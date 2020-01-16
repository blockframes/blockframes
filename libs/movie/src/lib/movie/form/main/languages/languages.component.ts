import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMainControl } from '../main.form';
import { default as staticModel } from '../../../static-model/staticModels';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';

@Component({
  selector: '[form] movie-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguagesComponent implements OnInit {

  @Input() form: MovieMainControl['originalLanguages'];
  private focusIndex = new BehaviorSubject(0);
  languages = staticModel.LANGUAGES;

  filteredLanguages$: Observable<typeof staticModel.TERRITORIES>;

  ngOnInit() {
    this.filteredLanguages$ = this.focusIndex.pipe(
      // Use startWith inside switchMap to reinitialize when new focus
      switchMap(i => this.form.at(i).valueChanges.pipe(startWith(''))),
      map((language: string) => language ? this._filter(language) : this.languages.slice())
    );
  }

  // When input got focus update the source of value
  focus(i: number) {
    this.focusIndex.next(i);
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    if (key) {
      return staticModel.LANGUAGES.find(({ slug }) => slug === key).label;
    }
  }

  private _filter(language: string) {
    const filterValue = language.toLowerCase();
    return this.languages.filter(({ label }) => label.toLowerCase().indexOf(filterValue) === 0)
  }

}
