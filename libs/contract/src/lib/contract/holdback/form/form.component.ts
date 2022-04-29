import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Holdback, Movie } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { SelectionModalComponent } from '../selection-modal/selection-modal.component';

@Component({
  selector: 'holdbacks-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolbackFormComponent {
  @Input() title: Movie;
  @Input() holdbacks: Holdback[] = [];
  @Output() holdbacksChange = new EventEmitter<Holdback[]>();

  constructor(private dialog: MatDialog) {}

  openHoldbacks() {
    this.dialog.open(SelectionModalComponent, {
      data: createModalData({
        title: this.title,
        holdbacks: this.holdbacks,
        holdbacksChange: this.holdbacksChange
      }, 'large')
    });
  }
}
