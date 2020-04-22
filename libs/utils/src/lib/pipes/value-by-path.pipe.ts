import { Pipe, PipeTransform, NgModule } from "@angular/core"

/** Get the value of a deep nested key in an object */
export function valueByPath(object: object, path: string) {
  if (object) {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null
    }, object)
  }
}

@Pipe({ name: 'valueByPath', pure: true })
export class ValueByPathPipe implements PipeTransform {
  transform(value: object, path: string) {
    return valueByPath(value, path);
  }
}

@NgModule({
  declarations: [ValueByPathPipe],
  exports: [ValueByPathPipe],
})
export class ValueByPathModule {} 