import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Step, DeliveryService } from '../+state';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-settings',
  templateUrl: './delivery-settings.component.html',
  styleUrls: ['./delivery-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsComponent implements OnInit, OnDestroy {
  public hasForm = false;
  public steps$: Observable<Step[]>;
  public stepId: string;
  private isAlive = true;

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    ) {}

  ngOnInit() {
    this.service.suscribeOnDeliveriesByActiveMovie().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.steps$ = this.query.steps$;
  }

  public openForm() {
    this.hasForm = true;
  }

  public cancel() {
    this.hasForm = false;
  }

  public openEdit(step: Step) {
    this.stepId = step.id;
  }

  public cancelEdit() {
    delete this.stepId;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
