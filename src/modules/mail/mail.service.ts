import { User } from "@/database/entities/user.entity";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class MailService {
	private logger = new Logger(MailService.name);

	constructor(
		@InjectQueue('mail') private mailQueue: Queue
	) {}

	sendWelcome(user: User, password: string) {
		this.logger.debug(`Adding job to queue: welcome - ${user.email}`);
		return this.mailQueue.add('welcome', { user, password });
	}

	sendResetPassword(user: User, token: string) {
		this.logger.debug(`Adding job to queue: reset-password - ${user.email}`);
		return this.mailQueue.add('reset-password', { user, token });
	}
}
