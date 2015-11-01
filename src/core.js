const root = './core';
module.exports = {
	Cache:			require(`${root}/cache`),
	Database:		require(`${root}/database`),
	File: 			require(`${root}/file`),
	Http: 			require(`${root}/http`),
	Logger: 		require(`${root}/log/logger`),
	LoggerFactory: 	require(`${root}/log/loggerFactory`),
	Router: 		require(`${root}/router`)
}