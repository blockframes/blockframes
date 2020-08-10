// RxJs
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { startWith } from 'rxjs/operators';

// Angular
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  OnDestroy,
} from '@angular/core';


// Types
import {  LanguagesSlug } from '@blockframes/utils/static-model';

// Utils
import { FormStaticValue } from '@blockframes/utils/form';
import { FormList } from '@blockframes/utils/form/forms/list.form';

// Form
import { MovieVersionInfoForm, VersionSpecificationForm } from '../movie.form';
import { createMovieLanguageSpecification } from '../../+state/movie.model';

@Component({
  selector: '[form] [originalLanguages] movie-form-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormVersionInfoComponent implements OnInit, OnDestroy {
  @Input() form: MovieVersionInfoForm;
  @Input() originalLanguages: FormList<LanguagesSlug, FormStaticValue<'LANGUAGES'>>
  added$: BehaviorSubject<LanguagesSlug[]>;
  original$: Observable<LanguagesSlug[]>;
  languageForm = new FormStaticValue('' as any, 'LANGUAGES');

  private sub: Subscription;

  newLanguage() {
    const language = this.languageForm.value;
    if (!this.form.controls[language]) {
      const spec = createMovieLanguageSpecification();
      this.form.setControl(language, new VersionSpecificationForm(spec));
      this.added$.next([ ...this.added$.getValue(), language ])
    }
    this.languageForm.reset();
  }

  removeLanguage(language: LanguagesSlug) {
    if (this.form.controls[language]) {
      this.form.removeControl(language);
      this.added$.next(this.added$.getValue().filter(l => l !== language))
    }
  }


  ngOnInit() {
    const allLanguages = Object.keys(this.form.value) as LanguagesSlug[];
    const originals = this.originalLanguages.value;
    const added = allLanguages.filter(language => !originals.includes(language));
    this.added$ = new BehaviorSubject(added);
    this.original$ = this.originalLanguages.valueChanges.pipe(startWith(originals));
    this.sub = this.original$.subscribe(languages => {
      languages.forEach(language => {
        if (!this.form.get(language)) {
          const spec = createMovieLanguageSpecification({ original: true });
          this.form.setControl(language, new VersionSpecificationForm(spec));
        }
      });
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
