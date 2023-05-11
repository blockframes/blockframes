// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

// Blockframes
import { Language, languages } from '@blockframes/model';

// RxJs
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export class User {
  constructor(public firstname: string, public lastname: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}

@Component({
  selector: 'scope-multiselect',
  templateUrl: './scope-multiselect.component.html',
  styleUrls: ['./scope-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeMultiselectComponent implements OnInit {
  control = new UntypedFormControl();

  languages = Object.keys(languages) as Language[];
  languagesObject = languages;

  selectedLanguages: Language[] = [];

  filteredLanguages: Observable<Language[]>;
  lastFilter = '';

  ngOnInit() {
    this.filteredLanguages = this.control.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : this.lastFilter)),
      map(filter => this.filter(filter))
    );
  }

  filter(filter: string): Language[] {
    this.lastFilter = filter;
    if (filter) {
      return this.languages.filter(option => {
        return option.indexOf(filter) >= 0;
      });
    } else {
      return this.languages.slice();
    }
  }

  displayFn(value: Language[] | string): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      value.forEach((language, index) => {
        if (index === 0) {
          displayValue = languages[language];
        } else {
          displayValue += ', ' + languages[language];
        }
      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }

  optionClicked(event: Event, language: Language) {
    event.stopPropagation();
    this.toggleSelection(language);
  }

  toggleSelection(language: Language) {
    if (!this.selectedLanguages.includes(language)) {
      this.selectedLanguages.push(language);
    } else {
      const i = this.selectedLanguages.findIndex(value => value === language);
      this.selectedLanguages.splice(i, 1);
    }

    this.control.setValue(this.selectedLanguages);
  }
}
