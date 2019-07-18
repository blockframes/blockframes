import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'org-signer-repertory',
  templateUrl: './organization-signer-repertory.component.html',
  styleUrls: ['./organization-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerRepertoryComponent implements OnInit {
 /** Headline of the columns in the material table */
 public displayedColumns: string[] = ['User', 'Mail', 'Signatory on', 'empty'];

 /** Variable to save the data source of the material table */
 // TODO #638 replace any
 public dataSource: MatTableDataSource<Array<any>>;

 // TODO #638: replace any
 @Input() signerList: any;

 // TODO #638: replace any
 @Output() editSigner: EventEmitter<any> = new EventEmitter();

 /** Init code to work with the build in material sort function */
 @ViewChild(MatSort, { static: true }) sort: MatSort;

 ngOnInit() {
   this.dataSource = new MatTableDataSource(this.signerList);
   this.dataSource.sort = this.sort;
 }

}
