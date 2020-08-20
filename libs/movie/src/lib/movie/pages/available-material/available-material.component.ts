import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-available-material',
  templateUrl: 'available-material.component.html',
  styleUrls: ['./available-material.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormAvailableMaterialComponent implements OnInit {

  public form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  get languages() {
    console.log(this.form.get('languages'))
    return this.form.get('languages')
  }

  ngOnInit() {
    console.log(this.form)
   }
}