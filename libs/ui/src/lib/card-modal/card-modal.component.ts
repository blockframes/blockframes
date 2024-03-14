import { AfterViewInit, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'bf-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  // change detection break the behavior of the component
})
export class CardModalComponent implements AfterViewInit {

  public isOpened = false;
  private initialHeight: number;

  @HostBinding('style.height') height;
  @ViewChild('container') container: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    this.initialHeight = this.container.nativeElement.offsetHeight;
    if (this.container.nativeElement.offsetHeight >= 512) {
      this.height = `${this.container.nativeElement.offsetHeight}px`;
    }
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
    this.height = this.initialHeight > 0 ? `${this.initialHeight}px` : undefined;
    this.isOpened = false;
  }
}