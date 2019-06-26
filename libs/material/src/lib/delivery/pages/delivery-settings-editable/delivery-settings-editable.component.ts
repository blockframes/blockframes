import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Step, DeliveryService, Delivery } from '../../+state';
import { MovieQuery, Movie } from '@blockframes/movie';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'delivery-settings-editable',
  templateUrl: './delivery-settings-editable.component.html',
  styleUrls: ['./delivery-settings-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsEditableComponent implements OnInit {
  public hasForm = false;
  public delivery$: Observable<Delivery>;
  public movie$ : Observable<Movie>;
  public stepId: string;

  public form = new FormGroup({
    dueDate: new FormControl()
  });

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private movieQuery: MovieQuery,
    private router: Router,
    private snackBar: MatSnackBar,
    ) {}

  ngOnInit() {
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

  public saveSettings(deliveryId: string) {
    this.router.navigate([`layout/with-org-segment/${this.movieQuery.getActiveId()}/${deliveryId}/edit`]);
    this.snackBar.open('Settings saved.', 'Close', {duration: 2000,});
  }
}
