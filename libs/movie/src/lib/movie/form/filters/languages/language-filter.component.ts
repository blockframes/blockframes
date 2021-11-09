import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormList, FormEntity } from '@blockframes/utils/form';
import { GetKeys } from '@blockframes/utils/static-model/static-model';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { LanguagesSearch, LanguageVersionControl } from '@blockframes/movie/form/search.form';
import { FormControl } from '@angular/forms';
import { Language } from '@blockframes/utils/static-model';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent implements OnInit, OnDestroy {

  @Input() languagesFilterForm: FormEntity<LanguageVersionControl>; // FormGroup of FormArray
  @Input() selectedLanguages$: Observable<LanguagesSearch>;

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = FormList.factory<GetKeys<'languages'>>([]);

  public versions = FormList.factory<GetKeys<'movieLanguageTypes'>>(['original', 'dubbed', 'subtitle'], el => new FormControl(el))

  private subs: Subscription[] = [];

  /** versions value in languagesFilterForm are rebuild for every change. This boolean prevents accidently recognizing a change as a reset */
  private rebuildingForm = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const sub = combineLatest([
      this.selectedLanguages.valueChanges,
      this.versions.valueChanges,
    ])
      .pipe(startWith([[], []] as [GetKeys<'languages'>[], GetKeys<'movieLanguageTypes'>[]]))
      .subscribe(
        ([languages, versions]) => {
          this.rebuildingForm = true;
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
          this.rebuildingForm = false;
        }
      );

    /** Updates selectedLanguages and versions FormList when reset is called on languagesFilterForm */
    const sub1 = this.languagesFilterForm.valueChanges.subscribe((res: LanguagesSearch) => {
      if (Object.values(res).every(value => value.length === 0)) {
        this.languagesFilterForm.markAsPristine();
        if (!this.rebuildingForm) {
          this.selectedLanguages.reset();
          this.versions.reset();
          this.cdr.markForCheck();
        }
      } else {
        this.languagesFilterForm.markAsDirty();
      }
    })
    if (this.selectedLanguages$) {
      const sub2 = this.selectedLanguages$.subscribe(data => this.hardReset(data))
      this.subs.push(sub2)
    }
    this.subs.push(sub, sub1);
  }

  hardReset(data?: LanguagesSearch) {
    if (!data) return;
    const duplicateCountries: Language[] = []
    const _versions: (keyof LanguagesSearch)[] = [];
    for (const k in data) {
      duplicateCountries.push(...data[k]);
      _versions.push(k as keyof LanguagesSearch)
    }
    const countries = Array.from(new Set(duplicateCountries)) as Language[];
    this.selectedLanguages.patchAllValue(countries, { emitEvent: false })
    this.versions.patchAllValue(_versions, { emitEvent: false })
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
