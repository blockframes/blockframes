import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { Step } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'delivery-informations-deadlines-repertory',
  templateUrl: './delivery-informations-deadlines-repertory.component.html',
  styleUrls: ['./delivery-informations-deadlines-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesRepertoryComponent {

  @Input() set deadlines(deadlines: any[]) {
    this.dataSource = new MatTableDataSource(deadlines);
  }

  @Output() editing = new EventEmitter();

  public dataSource: MatTableDataSource<any>;
  public displayedColumns: string[] = ['label', 'percentage', 'date'];
}
