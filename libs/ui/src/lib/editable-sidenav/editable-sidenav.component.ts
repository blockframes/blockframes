import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'editable-sidenav',
  templateUrl: './editable-sidenav.component.html',
  styleUrls: ['./editable-sidenav.component.scss']
})
export class EditableSidenavComponent {

  @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;
  @Input() opened = false;
  @Output() closed = new EventEmitter();

  public closeSidenav() {
    this.opened = false;
    this.closed.emit();
  }
}
