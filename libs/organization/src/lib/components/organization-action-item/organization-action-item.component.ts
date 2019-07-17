import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'org-action-item',
  templateUrl: './organization-action-item.component.html',
  styleUrls: ['./organization-action-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionItemComponent implements OnInit {
  // The columns we want to display
  public displayedColumns: string[] = ['Document name', 'Signers', 'Countersigners', 'Date'];

  public dataSource;

  // TODO #638: replace any and make it an Observable
  @Input() actionItems$: any;

  // TODO #638: replace any
  @Output() clickedOnSigners: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.actionItems$);
    this.dataSource.sort = this.sort;
  }

  /** This is a helper function which checks if the Observable got a key in his object stream,
   * if not we going to display somehting else.
   */
  // TODO #638: the input is going to be an Observable, so fit the function
  public hasDateValue() {
    return true
  }
}
