import { JwtModuleOptions } from "@nestjs/jwt";
import { ValidationPipeOptions } from "@nestjs/common";
import { join } from "path";
import { ValidationError } from "class-validator";
import { ValidationException } from "./exceptions/validation.exception";

interface IAppConfig {
	port: number;
	validator: ValidationPipeOptions;
}

const {
	PORT = 3001,
	JWT_KEY = "Secret#123",
	JWT_EXPIRATION = "15m"
} = process.env;

export const appConfig: IAppConfig = {
	port: Number(PORT),
	validator: {
		skipMissingProperties: true,
		exceptionFactory: (errors: ValidationError[]) => {
			const messages = errors.map((error) => {
				const constraints = Object.values(error.constraints);
                return constraints[0];
            })
			return new ValidationException(messages);
		},
		whitelist: true
	}
};

export const jwtConfig: JwtModuleOptions = {
	secret: JWT_KEY,
	signOptions: {
		expiresIn: JWT_EXPIRATION
	}
}

interface IStoragePath {
	[ key: string ]: string;
}

export const storagePaths: IStoragePath = {
	uploads: join(__dirname, "../../storage/uploads")
}
