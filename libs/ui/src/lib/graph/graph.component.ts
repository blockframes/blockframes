
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'bf-graph-container',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GraphContainerComponent implements AfterViewInit {

  dragging = false;

  public offset = new BehaviorSubject({ x: 0, y: 0, z: 1 });

  @ViewChild('dragContainer') container: ElementRef<HTMLDivElement>;

  ngAfterViewInit(
  ) {
    this.offset.subscribe(offset => {
      this.container.nativeElement.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${offset.z})`;
    });
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const noDrag = (event.target as HTMLElement).classList.contains('nodrag');
    if (noDrag) return;
    this.dragging = true;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(arg: MouseEvent) {
    if (!this.dragging) return;
    const value = this.offset.getValue();
    value.x += arg.movementX;
    value.y += arg.movementY;
    this.offset.next(value);
  }
  
  @HostListener('mouseup')
  onMouseUp() {
    this.dragging = false;
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.dragging = false;
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    // TODO compute offset so that the zoom is centered on the mouse
    // const value = this.offset.getValue();
    // value.z -= (event.deltaY / 600);
    // value.z = Math.max(0.1, value.z); // z can't be less than 0.01
    // value.z = Math.min(2.5, value.z); // z can't be more than 2.5
    // this.offset.next(value);
    this.zoom(-(event.deltaY / 600));
  }

  zoomOut() {
    this.zoom(-0.1);
  }

  zoomIn() {
    this.zoom(0.1);
  }

  zoom(value: number) {
    // TODO compute offset so that the zoom is centered on the mouse
    // const startOffset = this.container.nativeElement.getBoundingClientRect();
    const newOffset = this.offset.getValue();
    newOffset.z += value;
    newOffset.z = Math.max(0.1, newOffset.z); // z can't be less than 0.01
    newOffset.z = Math.min(2.5, newOffset.z); // z can't be more than 2.5
    // newOffset.x += newOffset.z;
    // newOffset.y += newOffset.z;
    this.offset.next(newOffset);
    // const endOffset = this.container.nativeElement.getBoundingClientRect();
    // const deltaX = startOffset.x - endOffset.x;
    // const deltaY = startOffset.y - endOffset.y;
    // console.log({ startOffset, endOffset, delta: { x: deltaX, y: deltaY } });

    // newOffset = this.offset.getValue();
    // newOffset.x += deltaX;
    // newOffset.y += deltaY;
    // this.offset.next(newOffset);
  }
}


// for 1.1 zoom, translate must be 76px & 26px
