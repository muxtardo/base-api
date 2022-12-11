import { User } from '@/database/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process, OnQueueActive, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from "@nestjs/common";
import { Job } from 'bull';
import * as moment from 'moment';

const { APP_NAME, APP_URL } = process.env;
@Processor('mail')
export class MailProcessor {
	private logger = new Logger(MailProcessor.name);
	private defaultContext = {
		app_name: APP_NAME,
		app_url: APP_URL,
		current: {
			date: moment().format('DD/MM/YYYY'),
			time: moment().format('HH:mm:ss'),
			year: moment().format('YYYY')
		}
	};

	constructor(
		private readonly mailerService: MailerService
	) {}

	@OnQueueActive()
	onActive(job: Job) {
		this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);
	}

	@OnQueueCompleted()
	onCompleted(job: Job, result: any) {
		this.logger.log(`Completed job ${job.id} of type ${job.name} with result ${result}`);
	}

	@OnQueueFailed()
	onFailed(job: Job, error: Error) {
		this.logger.error(`Job ${job.id} failed: ${error.message}`);
	}

	@Process('welcome')
	async sendWelcome(job: Job<{user: User, password: string}>) {
		const { user, password } = job.data;

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Welcome',
			template: './users/welcome',
			context: {
				...this.defaultContext,
				user: { ...user, password},
				url: APP_URL.concat(`/auth/login`)
			}
		});
	}

	@Process('redefinicao-password')
	async sendResetPassword(job: Job<{user: User, token: string}>) {
		const { user, token } = job.data;

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Reset Password',
			template: './auth/reset-password',
			context: {
				...this.defaultContext,
				user, token,
				url: APP_URL.concat(`/auth/reset-password?token=${token}`)
			}
		});

		return;
	}
}
