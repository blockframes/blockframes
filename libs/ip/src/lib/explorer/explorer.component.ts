import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IpQuery, Ip, IpService } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddComponent } from './../add/add.component'
import { Router } from '@angular/router';

@Component({
  selector: 'ip-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerComponent implements OnInit {
  public ipList$: Observable<Ip[]>;
  public ipForm$: Observable<Ip>;
  public selected: string[] = [];

  constructor(
    private service: IpService,
    private query: IpQuery,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit() {
    this.ipForm$ = this.query.form$;
    this.ipList$ = this.query.selectAll();
  }

  get isIndeterminate() {
    return this.selected.length > 0 && this.selected !== this.query.getValue().ids;
  }

  get isAllSelected() {
    return this.selected === this.query.getValue().ids;
  }

  // Select / Unselect
  public toggleOne({ checked }, id: string) {
    checked
      ? this.selected.push(id)
      : this.selected.splice(this.selected.indexOf(id), 1);
  }

  // Select / Unselect all ips
  public toggleAll({checked}) {
    checked
      ? this.selected = this.query.getValue().ids as string[]
      : this.selected = [];
  }

  public remove(ids: string[]) {
    this.service.remove(ids);
  }

  public add() {
    const dialogRef = this.dialog.open(AddComponent, {
      width: '450px',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(title => {
      if(title !== undefined) {
        this.snackBar.open('Ip created. Redirecting ..', 'close', { duration: 5000 });

        this.service.add({ title }).then((ipId) => {
          this.router.navigate(['/c','ip', ipId, 'edit']);
        })
      }
    });
  }
}