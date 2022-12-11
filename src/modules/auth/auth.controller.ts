import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ResetPasswordGuard } from "@/common/guards/reset-password.guard";
import { User } from "@/database/entities/user.entity";
import { Body, Controller, Ip, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RecoveryPasswordDto } from "./dto/recovery-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) {}

	@Post('login')
	login(@Body() loginDto: LoginDto, @Ip() ip: string) {
		return this.authService.login(loginDto, ip);
	}

	@Post('recovery-password')
	recoveryPassword(@Body() recoveryPasswordDto: RecoveryPasswordDto) {
		return this.authService.recoveryPassword(recoveryPasswordDto);
	}

	@Patch('reset-password')
	@UseGuards(ResetPasswordGuard)
	resetPassword(@CurrentUser() user: User, @Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(user, resetPasswordDto);
	}
}
