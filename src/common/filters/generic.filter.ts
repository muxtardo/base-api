import { Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class GenericExceptionsFilter implements ExceptionFilter {
	catch(exception: any, host: any) {
		console.log(exception);
	}
}
