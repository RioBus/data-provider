import ICollection = require("./iCollection");
import List = require("../../common/tools/list");

interface IDatabase {
	collection<T>(name: string): ICollection<T>;
}
export = IDatabase;