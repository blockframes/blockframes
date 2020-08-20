// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { LanguagesSlug } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-form-available-material',
  templateUrl: 'available-material.component.html',
  styleUrls: ['./available-material.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormAvailableMaterialComponent implements OnInit {

  public form = this.shell.form;

  public languageCtrl = new FormControl()

  constructor(private shell: MovieFormShellComponent) { }

  addLanguage() {
    const spec = createMovieLanguageSpecification({});
    this.form.get('languages').setControl(this.languageCtrl.value as LanguagesSlug, new VersionSpecificationForm(spec));
    this.languageCtrl.reset()
  }

  ngOnInit() {
    console.log(this.form)
   }
}