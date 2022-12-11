import { jwtConfig } from "@/common/constants";
import { User } from "@/database/entities/user.entity";
import { UserService } from "@/modules/user/user.service";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
	private logger = new Logger(AuthStrategy.name);

	constructor(
		private readonly userService: UserService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConfig.secret
		});
	}

	async validate(payload: IJwtPayload): Promise<User> {
		const { id, type } = payload;
		if (type !== 'user') throw new UnauthorizedException('Invalid token type');

		const user = await this.userService.findById(id, ['permissions']);
		if (!user) throw new UnauthorizedException('User not found');

		this.logger.debug(`User ${user.id} authenticated`);
		return user;
	}
}
