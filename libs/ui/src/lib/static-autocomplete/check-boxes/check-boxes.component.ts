import { Component, Input, ChangeDetectionStrategy, OnInit, } from '@angular/core';
import { staticModel, Scope } from '@blockframes/utils/static-model';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form][scope] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit {
  /**
   * The static scope or constant to display
   * @example
   * <static-check-boxes scope="territories" ...
   */
  @Input() scope: Scope;

  // The form to connect to
  @Input() form: FormControl;

  public items: unknown;
  public keepOrder = () => 1;

  ngOnInit() {
    this.items = staticModel[this.scope];
  }
}
