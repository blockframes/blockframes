import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateQuery } from '../../template/+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { DeliveryService } from '@blockframes/delivery';
import { NewTemplateComponent } from './new-template.component';

@Component({
  selector: 'delivery-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {
  public template$: Observable<any>;

  constructor(
    private templateQuery: TemplateQuery,
    private deliveryService: DeliveryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.template$ = this.templateQuery.materialsByTemplate$;
    this.template$.subscribe(x => console.log(x))
  }

  public openDialog() {
    this.dialog.open(NewTemplateComponent);
  }

  public createDelivery() {
    this.deliveryService.createDelivery();
  }
}
