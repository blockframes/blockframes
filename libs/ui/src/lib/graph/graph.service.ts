
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class GraphService {

  public bounds = new BehaviorSubject({ minX: 0, maxX: 1_000, minY: 0, maxY: 1_000 });
  public offset = new BehaviorSubject({ x: 14, y: 6, z: 1 });

  /** Move a given amount from the current position */
  move(deltaX: number, deltaY: number) {
    const value = this.offset.getValue();
    const bounds = this.bounds.getValue();
    value.x += deltaX;
    value.y += deltaY;

    value.x = Math.min(value.x, -bounds.minX);
    value.y = Math.min(value.y, -bounds.minY);
    value.x = Math.max(value.x, -bounds.maxX);
    value.y = Math.max(value.y, -bounds.maxY);

    this.offset.next(value);
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

  updateBounds(bounds: { minX: number, maxX: number, minY: number, maxY: number }) {
    const value = this.offset.getValue();

    value.x = Math.min(value.x, -bounds.minX);
    value.y = Math.min(value.y, -bounds.minY);
    value.x = Math.max(value.x, -bounds.maxX);
    value.y = Math.max(value.y, -bounds.maxY);

    this.offset.next(value);
    this.bounds.next(bounds);
  }
}
