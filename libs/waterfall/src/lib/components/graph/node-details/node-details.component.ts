import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { RightForm, RightFormValue } from '../../../form/right.form';
import { Observable, map, startWith } from 'rxjs';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-graph-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphNodeDetailsComponent implements OnInit {
  @Input() public rightForm: RightForm;
  @Input() public rightId: string;

  public rights$ = this.shell.rights$;
  public right$: Observable<RightFormValue>;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.right$ = this.rightForm.valueChanges.pipe(
      startWith(this.rightForm.getRawValue()),
      map(() => this.rightForm.getRawValue())
    );
  }
}