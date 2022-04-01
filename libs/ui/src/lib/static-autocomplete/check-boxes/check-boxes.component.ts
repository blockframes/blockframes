import { Component, Input, ChangeDetectionStrategy, OnInit, } from '@angular/core';
import { staticModel, Scope } from '@blockframes/shared/model';
import { FormStaticValueArray } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';

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
  @Input() @boolean multiple = true;
  // The form to connect to
  @Input() form: FormStaticValueArray<Scope>;

  public items: unknown;
  public keepOrder = () => 1;

  ngOnInit() {
    this.items = staticModel[this.scope];
  }
}
