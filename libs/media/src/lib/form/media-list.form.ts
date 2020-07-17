import { EntityControl, FormEntity } from "@blockframes/utils/form/forms/entity.form";

// TODO when we will transition to ImgIx we can remove the generic part of this form issue#3283
export class MediaFormList<C extends EntityControl<Record<string, T>>, T = any> extends FormEntity<C, Record<string, T>> {

  /**
   * Generate a key for the next element to insert.
   * We use incrementing number as key to ensure uniqueness and ascending order.
   */
  private getNextKey() {
    const keys = Object.keys(this.value);
    if (keys.length === 0) {
      return '0';
    } else {
      const lastKey = parseInt(keys[keys.length - 1], 10);
      return `${lastKey + 1}`;
    }
  }

  push(control: any) {
    const newKey = this.getNextKey();
    this.setControl(newKey, control);
  }
}
