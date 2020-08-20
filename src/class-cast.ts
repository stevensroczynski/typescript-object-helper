export const DNAME = 'deepObjects';

/**
 * This is a decorator to add to model attributes we want to keep typing for after transpile for
 * nested/ deep objects and arrays
 * Example:
 *    @ClassCast(Employee)
 *    public employee: Employee = undefined;
 */
export function ClassCast(cast: any): (target: any, classPropertyName: string) => void {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, classPropertyName: string): void {
    if (!target[DNAME]) {
      target[DNAME] = {};
    }
    target[DNAME][classPropertyName] = cast;
  };
}

