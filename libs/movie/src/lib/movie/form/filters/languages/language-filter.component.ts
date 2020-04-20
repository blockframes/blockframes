import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormList } from '@blockframes/utils/form';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { Subscription, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent implements OnInit, OnDestroy {

  @Input() languagesFilterForm: FormGroup; // FormGroup of FormArray

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = FormList.factory<ExtractSlug<'LANGUAGES'>>([]);

  public versions = FormList.factory<ExtractSlug<'VERSION_INFO'>>([]);

  private sub: Subscription;

  ngOnInit() {
    this.sub = combineLatest([this.selectedLanguages.valueChanges, this.versions.valueChanges])
    .pipe(startWith([]))
    .subscribe(
      ([languages, versions]) => {
        if (!versions || versions.length === 0) {
          (this.languagesFilterForm.get('original') as FormList<ExtractSlug<'LANGUAGES'>>).clear();
          (this.languagesFilterForm.get('dubbed') as FormList<ExtractSlug<'LANGUAGES'>>).clear();
          (this.languagesFilterForm.get('subtitle') as FormList<ExtractSlug<'LANGUAGES'>>).clear();
          (this.languagesFilterForm.get('caption') as FormList<ExtractSlug<'LANGUAGES'>>).clear();
        } else {
          versions.forEach(version => {
            // TODO I should have used patchAllValue instead of clear/add but the patchValue wasn't working as intended (see #2563)
            (this.languagesFilterForm.get(version) as FormList<ExtractSlug<'LANGUAGES'>>).clear();
            languages.map(lang => (this.languagesFilterForm.get(version) as FormList<ExtractSlug<'LANGUAGES'>>).add(lang));
          });
        }
      }
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
