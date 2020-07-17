import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'movie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormSynopsisComponent implements OnInit {
  values$: Observable<string[]>;
  form = this.shell.form;
  keyword = new FormControl();
  public separatorKeysCodes: number[] = [ENTER, COMMA];

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

  public add(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.keywords.add(value)
    this.keyword.reset();
  }

  public remove(i: number): void {
    this.keywords.removeAt(i);
  }
}
