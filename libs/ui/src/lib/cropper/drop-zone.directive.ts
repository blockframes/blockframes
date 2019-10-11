import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[dropZone]'
})
export class DropZoneDirective {
  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();

  constructor() {}

  @HostListener('drop', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDrop($event: any) {
    $event.preventDefault();
    this.dropped.emit($event.dataTransfer.files);
    this.hovered.emit(false);
  }

  @HostListener('dragover', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDragOver($event: any) {
    $event.preventDefault();
    this.hovered.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  // TODO: issue#875, use DragEvent type
  onDragLeave($event: any) {
    $event.preventDefault();
    this.hovered.emit(false);
  }
}
