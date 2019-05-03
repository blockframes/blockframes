import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Step, DeliveryService, Delivery } from '../+state';
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
  public delivery$: Observable<Delivery>;
  public movie$ : Observable<Movie>;
  public stepId: string;
  private isAlive = true;

  public form = new FormGroup({
    dueDate: new FormControl()
  });

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private movieQuery: MovieQuery,
    ) {}

  ngOnInit() {
    this.service.suscribeOnDeliveriesByActiveMovie().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.movie$ = this.movieQuery.selectActive();
    this.delivery$ = this.query.selectActive();
  }

  public saveDueDate(dueDate: Date) {
    this.service.updateDueDate(dueDate);
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
