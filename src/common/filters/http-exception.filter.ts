import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

interface IExceptionResponse {
	statusCode: number;
	message: string | string[];
	error: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private logger = new Logger(HttpExceptionFilter.name);

	catch(exception: HttpException, host: ArgumentsHost) {
		this.logger.error(exception);

		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const exceptionResponse = exception.getResponse ? (exception.getResponse() as IExceptionResponse) : null;

		return response.status(status).json({
			statusCode: status,
			message: exceptionResponse?.message || exception.message || "Internal server error"
		});
	}
}
