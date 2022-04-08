import { FormControl } from '@angular/forms';
import { FormList } from './list.form';
import { PerkForm } from '@blockframes/campaign/form/form';

describe('PatchAllValue should work for every possible abstract control', () => {
  it('should work for form control', () => {
    const formList = FormList.factory(['block', 'frames'], value => new FormControl(value))
    formList.patchAllValue(['max', 'francois'])
    expect(formList.length).toBe(2);
    expect(formList.value).toStrictEqual(['max', 'francois'])
  })

  /* We are also testing this with the reset function since in the movie tunnel when the user exit this tunnel and comes back,
  we reset the form. After reentering the tunnel, some values disappeared because the patchAllValues had troubles with already existing 
  controls. */

  it('should work for form control that has been reset', () => {
    const formList = FormList.factory(['block', 'frames'], value => new FormControl(value))

    formList.reset();

    formList.patchAllValue(['kebab', 'falafel'])
    expect(formList.length).toBe(2);
    expect(formList.value).toStrictEqual(['kebab', 'falafel'])
  })


  it('should work with custom FormGroup', () => {
    const formList = FormList.factory([{
      title: 'Test', description: 'description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    }], value => new PerkForm(value))
    formList.patchAllValue([{
      title: 'New Value', description: ' new description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    }])
    expect(formList.at(0).value).toStrictEqual({
      title: 'New Value', description: ' new description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    })
  })
  it('should work with custom FormGroup when it was reset', () => {
    const formList = FormList.factory([{
      title: 'Test', description: 'description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    }], value => new PerkForm(value))

    formList.reset();

    expect(formList.value.length).toBe(0)
    formList.patchAllValue([{
      title: 'New Value', description: ' new description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    }])
    expect(formList.at(0).value).toStrictEqual({
      title: 'New Value', description: ' new description', minPledge: 10, amount: {
        current: 5,
        total: 20
      }
    })
  })
})