import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Step, DeliveryService } from '../+state';
import { takeWhile } from 'rxjs/operators';
import { MovieQuery, Movie } from '@blockframes/movie';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'delivery-settings-view',
  templateUrl: './delivery-settings-view.component.html',
  styleUrls: ['./delivery-settings-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsViewComponent implements OnInit, OnDestroy {
  public hasForm = false;
  public steps$: Observable<Step[]>;
  public movie$ : Observable<Movie>;
  public stepId: string;
  private isAlive = true;

  public form = new FormGroup({
    date: new FormControl()
  });

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private movieQuery: MovieQuery,
    ) {}

  ngOnInit() {
    this.service.suscribeOnDeliveriesByActiveMovie().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.steps$ = this.query.steps$;
    this.movie$ = this.movieQuery.selectActive();

    this.form.setValue({date: '2019-09-29T22:00:00.000Z'});
  }

  public openForm() {
    this.hasForm = true;
    this.cancelEdit();
  }

  public cancelAdd() {
    this.hasForm = false;
  }

  public openEdit(step: Step) {
    this.stepId = step.id;
    this.cancelAdd();
  }

  public cancelEdit() {
    delete this.stepId;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
