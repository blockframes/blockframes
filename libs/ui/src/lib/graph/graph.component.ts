
import { Subscription } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';

import { GraphService } from './graph.service';


@Component({
  selector: 'bf-graph-container',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphContainerComponent implements AfterViewInit, OnDestroy {

  dragging = false;
  
  subscriptions: Subscription[] = [];

  @ViewChild('dragContainer') container: ElementRef<HTMLDivElement>;

  constructor(
    private service: GraphService,
  ) { }

  ngAfterViewInit(
  ) {
    const offsetSub = this.service.offset.subscribe(offset => {
      this.container.nativeElement.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${offset.z}) `;
    });
    const boundSub = this.service.bounds.subscribe(bounds => {
      this.container.nativeElement.style.width = `${bounds.maxX - bounds.minX}px`;
      this.container.nativeElement.style.height = `${bounds.maxY - bounds.minY}px`;
    });
    this.subscriptions.push(offsetSub, boundSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    this.service.move(arg.movementX, arg.movementY);
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
    this.service.zoom(-(event.deltaY / 600));
  }

  zoomOut() {
    this.service.zoom(-0.1);
  }

  zoomIn() {
    this.service.zoom(0.1);
  }
}
