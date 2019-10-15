import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Step } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'delivery-informations-steps-repertory',
  templateUrl: './delivery-informations-steps-repertory.component.html',
  styleUrls: ['./delivery-informations-steps-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsStepsRepertoryComponent {
  @Input()
  set steps(steps: Step[]) {
    this.dataSource = new MatTableDataSource(steps);
  }
  @Input() isSigned: boolean;

  @Output() editing = new EventEmitter();

  public dataSource: MatTableDataSource<Step>;
  public displayedColumns: string[] = ['name', 'date'];
}
