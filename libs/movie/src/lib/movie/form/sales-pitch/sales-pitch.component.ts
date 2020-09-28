import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { staticConsts } from '@blockframes/utils/static-model';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap, startWith } from 'rxjs/operators';

@Component({
  selector: 'movie-form-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesPitchComponent implements OnInit {
  form = this.shell.form;
  public staticGoals = Object.keys(staticConsts['socialGoals']);
  public goalForm = new FormControl();

  private sub : Subscription;
  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  ngOnInit() {

    this.sub = this.goalForm.valueChanges.pipe(
      tap(truc => console.log(this.goalForm.value)),
    )
    .subscribe();
    this.add();
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.sales_pitch/`;
  }

  get salesPitch() {
    return this.form.promotional.get('salesPitch');
  }

  get goals() {
    return this.form.get('goals');
  }

  public add() {
    this.form.goals.get('goal').add(this.goalForm.value);
  }

}
