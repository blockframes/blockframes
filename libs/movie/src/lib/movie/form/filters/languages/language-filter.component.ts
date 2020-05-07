import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormList, FormEntity } from '@blockframes/utils/form';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { Subscription, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { LanguageVersionControl } from '@blockframes/movie/form/search.form';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent implements OnInit, OnDestroy {

  @Input() languagesFilterForm: FormEntity<LanguageVersionControl>; // FormGroup of FormArray

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = FormList.factory<ExtractSlug<'LANGUAGES'>>([]);

  public versions = FormList.factory<ExtractSlug<'VERSION_INFO'>>([]);

  private sub: Subscription;

  ngOnInit() {
    this.sub = combineLatest([this.selectedLanguages.valueChanges, this.versions.valueChanges])
      .pipe(startWith([[], []] as [ExtractSlug<'LANGUAGES'>[], ExtractSlug<'VERSION_INFO'>[]]))
      .subscribe(
        ([languages, versions]) => {
          if (versions.length === 0) {
            for (const version in this.languagesFilterForm.controls) {
              this.languagesFilterForm.controls[version].clear()
            }
          } else {
            for (const version of versions) {
              this.languagesFilterForm.get(version).clear();
              languages.map(lang => this.languagesFilterForm.get(version).add(lang));
            }
          }
        }
      );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
