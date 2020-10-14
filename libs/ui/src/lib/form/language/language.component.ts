import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Language } from '@blockframes/utils/static-model';
import { FormConstantValue } from '@blockframes/utils/form';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GetKeys, languages } from '@blockframes/utils/static-model/staticConsts';

@Component({
  selector: 'form-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormLanguageComponent implements OnInit {
  @Input() public form: FormConstantValue<'languages'>;
  @Output() selected = new EventEmitter<GetKeys<'languages'>>();

  filteredLanguages$: Observable<Language[]>;

  ngOnInit() {
    this.filteredLanguages$ = this.form.valueChanges.pipe(
      startWith('' as Language),
      map(language => (language ? this.filter(language) : languages as any))
    );
  }

  // @dev displayFn "this" is the MatAutocomplete, not the component
  displayFn(key: string) {
    return languages[key];
  }

  private filter(language: string): Language {
    const filterValue = language.toLowerCase();
    return Object.values(languages).filter(label => label.toLowerCase().startsWith(filterValue)) as any;
  }
}
