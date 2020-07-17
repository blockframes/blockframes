import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'movie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormSynopsisComponent implements OnInit {
  values$: Observable<string[]>;
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    this.values$ = this.keywords.valueChanges.pipe(startWith(this.keywords.value));
  }

  get synopsis() {
    return this.form.get('story').get('synopsis');
  }

  get keyAssets() {
    return this.form.get('promotionalDescription').get('keyAssets');
  }

  get keywords() {
    return this.form.get('promotionalDescription').get('keywords');
  }
}
