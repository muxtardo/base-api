import { Match } from "@/common/decorators/validators/match.decorator";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
	@IsNotEmpty({ message: 'Password is required'})
	@IsString({ message: 'Password must be a string'})
	@MinLength(8, { message: 'Password must be at least 8 characters' })
	password: string;

	@IsNotEmpty({ message: 'Confirm password is required'})
	@Match('password', { message: 'Passwords do not match' })
	confirmPassword: string;
}
