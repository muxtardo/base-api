import { BullModule, InjectQueue } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, MiddlewareBuilder } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { Queue } from "bull";
import { createBullBoard } from "bull-board";
import { BullAdapter } from "bull-board/bullAdapter";
import { join } from "path";

import { AppController } from "./app.controller";

import { typeOrmOptions } from "./database/data-source";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { GenericExceptionsFilter } from "./common/filters/generic.filter";

import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { MailModule } from "./modules/mail/mail.module";
import { GithubModule } from "./modules/github/github.module";

@Module({
	controllers: [ AppController ],
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ ConfigModule ],
			useFactory: async (configService: ConfigService) => ({
				...typeOrmOptions
			}),
			inject: [ ConfigService ]
		}),
		BullModule.forRootAsync({
			imports: [ ConfigModule ],
			useFactory: async (configService: ConfigService) => ({
				redis: {
					host: configService.get("REDIS_HOST", "localhost"),
					port: Number(configService.get("REDIS_PORT", 6379)),
					password: configService.get("REDIS_PASS", null)
				},
			}),
			inject: [ ConfigService ]
		}),
		ThrottlerModule.forRootAsync({
			imports: [ ConfigModule ],
			useFactory: async (configService: ConfigService) => ({
				ttl: Number(configService.get("THROTTLE_TTL", 60)),
				limit: Number(configService.get("THROTTLE_LIMIT", 10))
			}),
			inject: [ ConfigService ]
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: join(__dirname, '/common/i18n/'),
				watch: true
			},
			resolvers: [
				{ use: QueryResolver, options: ["lang", "locale"] },
				{ use: HeaderResolver, options: ["App-Lang", "App-Locale"] }
			]
		}),

		MailModule,
		GithubModule,
		AuthModule,
		UserModule
	],
	providers: [
		{ provide: APP_FILTER, useClass: GenericExceptionsFilter },
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		{ provide: APP_GUARD, useClass: ThrottlerGuard }
	],
})
export class AppModule {
	constructor(
		@InjectQueue("mail") private mailQueue: Queue,
	) {}

	configure(consumer: MiddlewareBuilder) {
		const { router } = createBullBoard([
			new BullAdapter(this.mailQueue)
		]);
		consumer.apply(router)
			.forRoutes("/app-queues");
	}
}
