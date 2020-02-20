import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { staticModels } from '@blockframes/utils/static-model';
import { FormStaticValue } from '@blockframes/utils/form';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

type LANGUAGES = typeof staticModels.LANGUAGES;

@Component({
  selector: 'form-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormLanguageComponent implements OnInit {
  @Input() public form: FormStaticValue<'LANGUAGES'>;
  @Output() selected = new EventEmitter<ExtractSlug<'LANGUAGES'>>();

  public languages = staticModels.LANGUAGES;

  filteredLanguages$: Observable<LANGUAGES>;

  ngOnInit() {
    this.filteredLanguages$ = this.form.valueChanges.pipe(
      startWith(''),
      map(language => (language ? this.filter(language) : this.languages))
    );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    if (key) {
      return staticModels.LANGUAGES.find(({ slug }) => slug === key).label;
    }
  }

  private filter(language: string): LANGUAGES {
    const filterValue = language.toLowerCase();
    return this.languages.filter(
      ({ label }) => label.toLowerCase().indexOf(filterValue) === 0
    ) as any;
  }
}
