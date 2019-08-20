import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { Step } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'delivery-informations-steps-repertory',
  templateUrl: './delivery-informations-steps-repertory.component.html',
  styleUrls: ['./delivery-informations-steps-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsStepsRepertoryComponent {

  @Input() set steps(steps: Step[]) {
    this.dataSource = new MatTableDataSource(steps);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Step>;
  public displayedColumns: string[] = ['name', 'date'];
}
