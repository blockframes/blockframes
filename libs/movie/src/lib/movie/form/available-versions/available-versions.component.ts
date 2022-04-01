// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { createMovieLanguageSpecification } from '@blockframes/shared/model';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { Language } from '@blockframes/shared/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

// RxJs
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'movie-form-available-versions',
  templateUrl: 'available-versions.component.html',
  styleUrls: ['./available-versions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormAvailableVersionsComponent implements OnInit, OnDestroy {
  public form = this.shell.getForm('movie');

  public languageCtrl = new FormControl();

  public showButtons = true;

  private sub: Subscription;

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Available Versions');
  }

  ngOnInit() {
    this.formIsEmpty ? (this.showButtons = true) : (this.showButtons = false);
    this.sub = this.form.languages.valueChanges
      .pipe(
        tap(value => {
          if (Object.keys(value).includes('all')) {
            this.languageCtrl.disable();
            Object.keys(value).forEach((language: Language) => {
              if (language !== 'all') {
                this.deleteLanguage(language);
              }
            });
          } else {
            this.languageCtrl.enable();
            this.showButtons = true;
          }
        })
      )
      .subscribe();
  }

  get formIsEmpty() {
    return !!Object.keys(this.form.get('languages').controls).length;
  }

  addLanguage() {
    const spec = createMovieLanguageSpecification({});
    this.form.languages.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  showForm() {
    this.showButtons = !this.showButtons;
  }

  deleteLanguage(language: Language) {
    this.form.languages.removeControl(language);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
