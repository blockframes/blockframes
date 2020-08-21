// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
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

  public languageCtrl = new FormControl();

  public showLineButton = true;

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    this.formIsEmpty ? this.showLineButton = true : this.showLineButton = false;
    console.log(this.formIsEmpty)
  }

  get formIsEmpty() {
    return !!Object.keys(this.form.get('languages').controls).length
  }

  addLanguage() {
    const spec = createMovieLanguageSpecification({});
    this.form.languages.setControl(this.languageCtrl.value as LanguagesSlug, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showLineButton = true;
  }

  cancel() {
    this.languageCtrl.reset()
  }

  showForm() {
    this.showLineButton = !this.showLineButton
  }

  log(x) { console.log(x) }
}