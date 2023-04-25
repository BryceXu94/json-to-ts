/**
 * Age in array
 */
export interface testObjObjlistItem {
  /**
   * Age in years
   */
  objlistage?: number;
}
/**
 * 1213
 */
export interface testObj {
  objname: string;
  /**
   * Age in array
   */
  objlist?: testObjObjlistItem[];
  /**
   * Age in array
   */
  stringlist?: string[];
  hairColor?: "1" | "2";
}
/**
 * Age in array
 */
export interface testListItem {
  /**
   * Age in years
   */
  age?: number;
}
export interface test {
  firstName: string;
  /**
   * 1213
   */
  obj: testObj;
  /**
   * Age in array
   */
  list?: testListItem[];
  hairColor?: string;
}
