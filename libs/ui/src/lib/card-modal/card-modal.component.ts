
import { AfterViewInit, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';


@Component({
  selector: 'bf-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  // change detection break the behavior of the component
})
export class CardModalComponent implements AfterViewInit {

  isOpened = false;
  @HostBinding('style.height') height = 'auto';
  @ViewChild('container') container: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    this.height = `${this.container.nativeElement.offsetHeight}px`;
  }

  toggle() {
    if (this.isOpened) this.close();
    else this.open();
  }
  
  open() {
    this.height = `${this.container.nativeElement.offsetHeight}px`;
    this.isOpened = true;
  }
  
  close() {
    this.height = 'auto';
    this.isOpened = false;
  }
}