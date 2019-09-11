
export function formatCredit(str: string, separator: string = '\\s+'): any {
  const credit = {
    firstName: '',
    lastName: '',
  }

  if (str.split(new RegExp(separator)).length > 1) {
    credit.firstName = str.split(new RegExp(separator))[0];
    credit.lastName = str.split(new RegExp(separator))[1];
  } else {
    credit.lastName = str.split(new RegExp(separator))[0];
  }

  return credit;
}

export function formatCredits(str: string, separator: string = ','): any[] {
  const credits = [];
  str.split(separator).forEach((a: string) => {
    credits.push(formatCredit(a.trim()));
  });

  return credits;
}