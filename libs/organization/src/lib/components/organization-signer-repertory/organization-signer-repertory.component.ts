import { ControlContainer } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { OrganizationMember } from '../../+state';

@Component({
  selector: 'org-signer-repertory',
  templateUrl: './organization-signer-repertory.component.html',
  styleUrls: ['./organization-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerRepertoryComponent implements OnInit {
  /** Headline of the columns in the material table. No Headline meanse no text.*/
  public displayedColumns: string[] = ['User', 'Mail', 'Signatory on', 'No Headline'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<OrganizationMember>;

  @Input() signerList: OrganizationMember[];

  @Output() selected = new EventEmitter<OrganizationMember>();

  /** Init code to work with the build in material sort function.
   * But maybe this will get taken care of by a function in the future.
   */
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
 /** TODO(PL): This component should take in a form that
   *  that listen on the save icon button click event from the sidenav. 
   */
  constructor(public container: ControlContainer){}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.signerList);
    this.dataSource.sort = this.sort;
  }
}
