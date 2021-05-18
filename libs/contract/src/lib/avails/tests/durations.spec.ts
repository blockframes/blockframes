import { createMandate } from "../../contract/+state/contract.model";
import { toDurationMarker } from "./../avails";
import { createTerm } from "../../term/+state/term.model";

describe('Test DurationMarker', () => {

  it('Duration marker should contain good contract', () => {
    const mandateA = createMandate({ id: 'MandateA', termIds: ['termA'] });
    const mandateB = createMandate({ id: 'MandateB', termIds: ['termB'] });

    const termA = createTerm({ id: 'termA', contractId: mandateA.id });

    const selectedA = toDurationMarker([mandateA, mandateB], termA);
    expect(selectedA.contract.id).toEqual(mandateA.id);

    const selectedB = toDurationMarker([mandateA, mandateB], termA);
    expect(selectedB.contract.id).toEqual(mandateA.id);

    const selectedC = toDurationMarker([mandateB], termA);
    expect(selectedC.contract).toBeUndefined();
  });
})
