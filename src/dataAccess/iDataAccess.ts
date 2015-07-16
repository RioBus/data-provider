/**
 * IDataAccess type
 * Responsible for repository layer operations
 * @interface IDataAccess
 */
interface IDataAccess{
	
	/**
	 * Saves the data to the repository
	 * @param {any[]} args
	 */
	create(...args: any[]): any;
	
	/**
	 * Retrieves the data from the repository
	 * @param {any[]} args
	 */
	retrieve(...args: any[]): any;
	
	/**
	 * Updates the data in the repository
	 * @param {any[]} args
	 */
	update(...args: any[]): any;
	
	/**
	 * Removes the data from the repository
	 * @param {any[]} args
	 */
	delete(...args: any[]): any;
}
export = IDataAccess;