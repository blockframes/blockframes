import {
  WorkBook,
  WorkSheet,
  utils,
  writeFile,
  FullProperties,
  ColInfo,
  AOA2SheetOpts
}  from 'xlsx';

interface SheetOptions {
  name: string,
  sheet: WorkSheet
}

export function addNewSheetsInWorkbook(worksheets: SheetOptions[], workbook: WorkBook) {
  worksheets.forEach(({ name, sheet }) => utils.book_append_sheet(workbook, sheet, name));
}

export function addWorksheetColumnsWidth(data: unknown[][], worksheet: WorkSheet) {
  const colsWidth = calculateColsWidthFromArray(data);
  setWorksheetColumnsWidth(worksheet, colsWidth.map((n: number) => ({ width: n })));
}

/**
 * Calculate the width of columns with the total length of the letters + 5 to add some extra space.
 * @param arrayOfValue Array of Array
 * @param defaultSpace Will be used as a comparation with the width
 * @returns An array of number
 */
export function calculateColsWidthFromArray(arrayOfValue: unknown[][], defaultSpace: number = 15) {
  const maxCols: number[] = Array(arrayOfValue[0].length).fill(defaultSpace);
  for(let row = 0; row < arrayOfValue.length; row++) {
    for(let col = 0; col < arrayOfValue[row].length; col++) {
      const currentNumber = maxCols[col];
      const newNumber = arrayOfValue[row][col] ? `${arrayOfValue[row][col]}`.length + 5 : 0;
      if (currentNumber < newNumber) maxCols[col] = newNumber;
    }
  }
  return maxCols;
}

export function convertArrayToWorksheet(arrayOfValue: unknown[][], options?: AOA2SheetOpts) {
  return utils.aoa_to_sheet(arrayOfValue, options);
}

export function createWorkBook(properties: FullProperties) {
  const workbook = utils.book_new();
  workbook.Props = properties;
  return workbook;
}

export function exportSpreadsheet(workbook: WorkBook, filename: string ='SheetJS.xlsx') {
  writeFile(workbook, filename);
}

export function mergeWorksheetCells(ranges: string[], worksheet: WorkSheet) {
  const rangesArray = ranges.map(range => utils.decode_range(range));
  if(!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push(...rangesArray);
}

export function setWorksheetColumnsWidth(worksheet: WorkSheet, colsWidth: ColInfo[]) {
  worksheet['!cols'] = colsWidth;
}