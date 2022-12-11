import 'dotenv/config';
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./common/constants";
import helmet from 'helmet';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
	const logger = new Logger("Bootstrap");

	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useGlobalFilters(new ValidationExceptionFilter())
	app.useGlobalPipes(new ValidationPipe(appConfig.validator));
	app.use(helmet({
		crossOriginResourcePolicy: { policy: 'same-site' }
	}));

	const configService = app.get(ConfigService);
	config.update({
		accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
		secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
		region: configService.get<string>('AWS_REGION')
	});

	await app.listen(configService.get<number>('PORT'));
	logger.log(`Application listening on: ${await app.getUrl()}`);
}
bootstrap();
