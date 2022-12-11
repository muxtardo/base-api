import { Catch, HttpException, HttpStatus } from '@nestjs/common';

export class BadFilterException extends HttpException {
	constructor(messaage?: string) {
		super(messaage || 'Bad Filter', HttpStatus.BAD_REQUEST);
	}
}
