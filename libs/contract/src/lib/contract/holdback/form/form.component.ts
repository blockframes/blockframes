import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Holdback, Movie } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { HoldbackForm } from '../form';
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
      data: {
        title: this.title,
        holdbacks: this.holdbacks,
        holdbacksChange: this.holdbacksChange
      }
    });
  }
}
