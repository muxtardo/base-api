import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailProcessor } from "./mail.processor";
import { MailService } from "./mail.service";

@Module({
	imports: [
		BullModule.registerQueue({ name: 'mail' }),
		MailerModule.forRootAsync({
			useFactory: async (config: ConfigService) => ({
				transport: {
					host: config.get('MAIL_HOST', 'smtp.mailtrap.io'),
					port: config.get<number>('MAIL_PORT', 587),
					secure: config.get<boolean>('MAIL_SSL', false),
					auth: {
						user: config.get('MAIL_USER', 'user'),
						pass: config.get('MAIL_PASS', 'pass')
					}
				},
				defaults: {
					from: `"${config.get('APP_NAME')}" <${config.get('MAIL_FROM')}>`,
				},
				template: {
					dir: join(__dirname, "templates"),
					adapter: new HandlebarsAdapter(),
					options: { strict: true }
				}
			}),
			inject: [ ConfigService ]
		})
	],
	providers: [ MailProcessor, MailService ],
	exports: [ MailService, MailProcessor, BullModule ]
})
export class MailModule {}
