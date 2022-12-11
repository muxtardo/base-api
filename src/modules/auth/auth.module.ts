import { jwtConfig } from "@/common/constants";
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailModule } from "../mail/mail.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./strategies/auth.strategy";
import { ResetPasswordStrategy } from "./strategies/reset-password.strategy";

@Module({
	imports: [
		MailModule,
		forwardRef(() => UserModule),
		PassportModule.register({ property: 'user' }),
		JwtModule.register(jwtConfig)
	],
	controllers: [
		AuthController
	],
	providers: [
		AuthService,
		AuthStrategy,
		ResetPasswordStrategy
	],
	exports: [
		AuthStrategy,
		ResetPasswordStrategy,
		PassportModule
	]
})
export class AuthModule {}
