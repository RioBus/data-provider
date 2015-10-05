declare var require, Buffer;
import File   = require("../../core/file");
import Config = require("../../config");

class Cache {
	
	private file: File;
	
	public constructor(key: string) {
		var dir: string = Config.cachePath;
		if(dir[dir.length-1]!=="/") dir += "/";
		this.file = new File(dir+key);
	}
	
	public retrieve(): string {
		return new Buffer(this.file.read(), "base64").toString("utf8");
	}
	
	public write(content: string): void {
		this.file.write(new Buffer(content).toString("base64"))
	}
}
export = Cache;