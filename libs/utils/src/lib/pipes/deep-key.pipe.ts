import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

/**
 * Helper function to dynamically access object value pointed by the `path` param, like the rxjs pluck function
 * @param object usually the result object from Algolia
 * @param path string representing the path to the value, usually `this.pathToValue` or `this.displayWithPath`
 * @example
 * const object = { main: { nested: { name: 'Joe' } } };
 * const path = 'main.nested.name';
 * this.resolve(result); // 'Joe'
 */
export const getDeepValue = (object: Object, path: string) => path.split('.').reduce((result, key) => result?.[key], object);

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {

    try {
      if (!value || !deepKey) return value;

      const conditions = deepKey.split('||').map(p => p.trim());

      if (Array.isArray(value)) {
        return value.map(obj => {
          const condition = conditions.find(c => !!getDeepValue(obj, c));
          return condition ? getDeepValue(obj, condition) : undefined;
        });
      } else {
        const condition = conditions.find(c => !!getDeepValue(value, c));
        return condition ? getDeepValue(value, condition) : undefined;
      }
    } catch (error) {
      console.warn('AN ERROR HAPPENED IN THE DeepKeyPipe');
      console.warn(error);
      return;
    }
  }
}

@NgModule({
  declarations: [DeepKeyPipe],
  exports: [DeepKeyPipe]
})
export class DeepKeyPipeModule { }
