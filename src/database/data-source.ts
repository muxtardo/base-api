import "dotenv/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { join } from "path";

const {
	DB_HOST = "localhost",
	DB_PORT = 5432,
	DB_USERNAME = "postgres",
	DB_PASSWORD = "postgres",
	DB_DATABASE = "proclamas",
	DB_SCHEMA = "public",
	DB_SYNCHRONIZE = false,
	DB_RETRY_ATTEMPTS = 10,
	DB_RETRY_DELAY = 3000
} = process.env;

export const typeOrmOptions: TypeOrmModuleOptions = {
	type: "postgres",
	host: DB_HOST,
	port: Number(DB_PORT) || 5432,
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	schema: DB_SCHEMA,
	synchronize: Boolean(DB_SYNCHRONIZE === "true") || false,
	retryAttempts: Number(DB_RETRY_ATTEMPTS) || 10,
	retryDelay: Number(DB_RETRY_DELAY) || 3000,
	entities: [ join(__dirname, "/entities/*") ],
	subscribers: [ join(__dirname, "/subscribers/*") ],
	migrations: [ join(__dirname, "/migrations/*") ]
}

export default new DataSource(typeOrmOptions as DataSourceOptions);
