import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormList, FormEntity } from '@blockframes/utils/form';
import { GetKeys } from '@blockframes/utils/static-model/static-model';
import { Subscription, combineLatest } from 'rxjs';
import { first, startWith } from 'rxjs/operators';
import { LanguageVersionControl } from '@blockframes/movie/form/search.form';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent implements OnInit, OnDestroy {

  @Input() languagesFilterForm: FormEntity<LanguageVersionControl>; // FormGroup of FormArray

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = FormList.factory<GetKeys<'languages'>>([]);

  public versions = FormList.factory<GetKeys<'movieLanguageTypes'>>(['original', 'dubbed', 'subtitle'], el => new FormControl(el))

  private sub: Subscription;
  private formSub: Subscription;

  /** versions value in languagesFilterForm are rebuild for every change. This boolean prevents accidently recognizing a change as a reset */
  private rebuildingForm = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = combineLatest([this.selectedLanguages.valueChanges, this.versions.valueChanges])
      .pipe(startWith([[], this.versions.value] as [GetKeys<'languages'>[], GetKeys<'movieLanguageTypes'>[]]))
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
    // Setting latest value in observable for combineLatest
    this.versions.setValue(this.versions.value);

    /** Updates selectedLanguages and versions FormList when reset is called on languagesFilterForm */
    this.formSub = this.languagesFilterForm.valueChanges.subscribe((res: Array<any>) => {
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
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }

}
