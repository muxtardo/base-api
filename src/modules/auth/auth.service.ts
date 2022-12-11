import { User } from "@/database/entities/user.entity";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { MailService } from "../mail/mail.service";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RecoveryPasswordDto } from "./dto/recovery-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { IAccessToken } from "./interfaces/access-token.interface";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
	private logger = new Logger(AuthService.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly mailService: MailService,
		private readonly userService: UserService
	) {}

	async login(
		{ email, password }: LoginDto,
		ipLogin: string
	): Promise<IAccessToken> {
		const user = await this.userService.findOneBy({ email });
		if (!(user && user.checkPassword(password))) throw new UnauthorizedException('Invalid credentials');

		// Create JWT token with user id and ip
		const payload = {
			id: user.id,
			ip: ipLogin,
			type: 'user'
		} as IJwtPayload;
		const access_token = this.jwtService.sign(payload);
		return { access_token };
	}

	async recoveryPassword({ email }: RecoveryPasswordDto) {
		const user = await this.userService.findOneBy({ email });
		if (!user) throw new UnauthorizedException('User not found');

		// Generate password reset token
		const passwordResetToken = uuidv4();

		// Save password reset token in database
		await this.userService.update(user.id, { passwordResetToken });

		// Create JWT token with password reset token
		const payload = {
			id: user.id,
			token: passwordResetToken,
			type: 'reset-password'
		} as IJwtPayload;
		const jwtToken = this.jwtService.sign(payload, { expiresIn: '15m' });
		this.mailService.sendResetPassword(user, jwtToken);

		return { message: 'An email has been sent to you with instructions to reset your password' };
	}

	async resetPassword(user: User, { password }: ResetPasswordDto) {
		// Update user password and reset password token
		await this.userService.update(user.id, {
			password,
			passwordResetToken: null
		});

		return { message: 'Password successfully updated' };
	}
}
