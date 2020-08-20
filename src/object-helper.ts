import { DNAME } from './class-cast';

export class ObjectHelper {

    /**
     * Creates a class typed object from string input
     * @param stringIn   The json string we want to create a class object from
     * @param classCast  The class constructor we want to create
     */
    public static objectFromString<T>(stringIn: string, classCast: new () => T): T {
        return ObjectHelper.copyObject(JSON.parse(stringIn), classCast);
    }

    /**
     *
     * @param arrayIn    The array of generic objects we want to create class objects from
     * @param classCast  The class constructor we want to create
     */
    public static copyArray<T>(arrayIn: any, classCast: new () => T): T[] {
        const arr: any[] = [];
        for (const obj of arrayIn as any) {
            arr.push(this.copyObject(obj, classCast));
        }
        return arr;
    }

    /**
     * Does a full copy on an object including nested objects and arrays (deep copy)
     * Removes attributes that are not in the destination class model
     * Also support typing of attributes and arrays.  If you want a nested attribute typed (for access
     * to it's functions) then add the @ClassCast decorator to the attribute in your model.  example:
     *    @ClassCast(Employee)
     *    public employee: Employee = undefined;
     *
     * @param objectIn   The generic object we want to create a class object from
     * @param classCast  The class constructor we want to create
     */
    public static copyObject<T>(objectIn: any, classCast: new () => T): T {
        const newInstance: T = new classCast();
        const keys = Object.keys(newInstance);
        for (const propertyKey of keys) {
            const attributeValue: any = objectIn[propertyKey];

            // check if the attribute is generic, custom object, or custom array
            // @ts-ignore
            if (!newInstance[DNAME] || !newInstance[DNAME][propertyKey]) {
                this.assignGenericAttribute(newInstance, propertyKey, attributeValue);
            } else {
                // @ts-ignore
                if (newInstance[DNAME][propertyKey] instanceof Array && attributeValue instanceof Array) {
                    this.assignArrayAttribute(newInstance, propertyKey, attributeValue);
                } else {
                    this.assignObjectAttribute(newInstance, propertyKey, attributeValue);
                }
            }
        }

        return newInstance;
    }

    /**
     * The model did not define a class type - assign as a generic
     * @param parent
     * @param attributeName
     */
    private static assignGenericAttribute(parent: any, attributeName: string, attributeValue: any): void {
        parent[attributeName] = attributeValue;
    }

    /**
     * The model defined an class array.  Create a full class object for each item in array
     * @param parent
     * @param attributeName
     */
    private static assignArrayAttribute(parent: any, attributeName: string, attributeValue: any): void {
        const arr: any[] = [];
        for (const obj of attributeValue as any) {
            arr.push(this.copyObject(obj, parent[DNAME][attributeName][0]));
        }
        parent[attributeName] = arr;
    }

    /**
     * The model defined a class attribute.  Create a full class object for this attribute
     * @param parent
     * @param attributeName
     */
    private static assignObjectAttribute(parent: any, attributeName: string, attributeValue: any): void {
        // value is null when we modeled an object that is not present in the json string - set to null
        if (!attributeValue) {
            parent[attributeName] = null;
        } else {
            if (attributeValue instanceof Array) {
                parent[attributeName] = this.copyArray(attributeValue, parent[DNAME][attributeName]);
            } else {
                parent[attributeName] = this.copyObject(attributeValue, parent[DNAME][attributeName]);
            }
        }
    }

}
