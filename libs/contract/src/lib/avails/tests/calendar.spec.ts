import { createMandate } from "../../contract/+state/contract.model";
import { toDurationMarker } from "./../avails";
import { createTerm } from "../../term/+state/term.model";
import { CellState, dateToMatrixPosition, isBefore, isContinuous, MatrixPosition } from '../calendar/calendar.model';

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
});

describe('Test Matrix', () => {

  it('Test isBefore', () => {
    const posA = { row: 1, column: 1 } as MatrixPosition;
    const posB = { row: 1, column: 2 } as MatrixPosition;
    const posC = { row: 1, column: 1 } as MatrixPosition;
    const posD = { row: 10, column: 10 } as MatrixPosition;
    const posE = { row: 10, column: 1 } as MatrixPosition;

    expect(isBefore(posA, posB)).toBeTruthy();
    expect(isBefore(posA, posC)).toBeFalsy();
    expect(isBefore(posA, posD)).toBeTruthy();
    expect(isBefore(posA, posE)).toBeTruthy();
  });

  it('Test dateToMatrixPosition', () => {
    const dateA = new Date('01/04/2028')
    const posA = dateToMatrixPosition(dateA);

    expect(posA.row).toEqual(7);
    expect(posA.column).toEqual(0);

    const dateB = new Date('12/30/2025')
    const posB = dateToMatrixPosition(dateB);

    expect(posB.row).toEqual(4);
    expect(posB.column).toEqual(11);

    // One month after posB but new year, should go to next row
    const dateC = new Date('01/25/2026')
    const posC = dateToMatrixPosition(dateC);

    expect(posC.row).toEqual(5);
    expect(posC.column).toEqual(0);

    // One month after posC but same year, should go to new column
    const dateD = new Date('02/25/2026')
    const posD = dateToMatrixPosition(dateD);

    expect(posD.row).toEqual(5);
    expect(posD.column).toEqual(1);
  });

  it('Test isContinuous', () => {
    const posA = { row: 0, column: 1 } as MatrixPosition;
    const posB = { row: 0, column: 2 } as MatrixPosition;
    const posC = { row: 0, column: 3 } as MatrixPosition;
    const posD = { row: 0, column: 5 } as MatrixPosition;
    const posE = { row: 4, column: 11 } as MatrixPosition;
    const posF = { row: 5, column: 0 } as MatrixPosition;
    const posG = { row: 5, column: 1 } as MatrixPosition;
    const posH = { row: 5, column: 3 } as MatrixPosition;
    const posI = { row: 5, column: 4 } as MatrixPosition;

    const stateMatrix = [[], [], [], [], [], []] as CellState[][];
    stateMatrix[posA.row][posA.column] = 'avail';
    stateMatrix[posB.row][posB.column] = 'avail';
    stateMatrix[posC.row][posC.column] = 'avail';
    stateMatrix[posD.row][posD.column] = 'avail';
    stateMatrix[posE.row][posE.column] = 'avail';
    stateMatrix[posF.row][posF.column] = 'avail';
    stateMatrix[posG.row][posG.column] = 'avail';
    stateMatrix[posH.row][posH.column] = 'avail';
    stateMatrix[posI.row][posI.column] = 'sold';

    expect(isContinuous(posA, posB, stateMatrix)).toBeTruthy();
    expect(isContinuous(posB, posA, stateMatrix)).toBeFalsy();
    expect(isContinuous(posB, posC, stateMatrix)).toBeTruthy();
    expect(isContinuous(posA, posC, stateMatrix)).toBeTruthy();
    expect(isContinuous(posC, posD, stateMatrix)).toBeFalsy();
    expect(isContinuous(posE, posF, stateMatrix)).toBeTruthy();
    expect(isContinuous(posE, posG, stateMatrix)).toBeTruthy();
    expect(isContinuous(posG, posH, stateMatrix)).toBeFalsy();
    expect(isContinuous(posH, posI, stateMatrix)).toBeFalsy();
  });
});



/**
 *
 * markersToMatrix
 *

 */