import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '../../+state';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {

  @Input() invitation: Invitation;
  public xs$ = this.breakpointsService.xs;

  constructor(private breakpointsService: BreakpointsService) {}
}
