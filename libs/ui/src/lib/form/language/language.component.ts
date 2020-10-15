import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { languages } from '@blockframes/utils/static-model';
import { FormConstantValue } from '@blockframes/utils/form';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GetKeys } from '@blockframes/utils/static-model/staticConsts';

type LANGUAGES = typeof languages;

@Component({
  selector: 'form-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormLanguageComponent implements OnInit {
  @Input() public form: FormConstantValue<'languages'>;
  @Output() selected = new EventEmitter<GetKeys<'languages'>>();

  public languages = languages;

  filteredLanguages$: Observable<LANGUAGES>;

  ngOnInit() {
    this.filteredLanguages$ = this.form.valueChanges.pipe(
      startWith(''),
      map(language => (language ? this.filter(language) : this.languages))
    );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    return languages[key];
  }

  private filter(language: string): LANGUAGES {
    const filterValue = language.toLowerCase();
    return Object.values(this.languages).filter(label => label.toLowerCase().startsWith(filterValue)) as any;
  }
}
