import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ValidationException } from "../exceptions/validation.exception";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost) : any {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
		const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		return response.status(status).json({
			statusCode: status,
			message: exception.validationErrors || "Validations failed"
		});
    }
}
