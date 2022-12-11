import { Match } from "@/common/decorators/validators/match.decorator";
import { NotMatch } from "@/common/decorators/validators/not-match.decorator";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangeUserPasswordDto {
	@IsNotEmpty({ message: 'Password is required'})
	@IsString({ message: 'Password must be a string'})
	password: string;

	@IsNotEmpty({ message: 'New password is required' })
	@IsString({ message: 'New password must be a string' })
	@MinLength(6, { message: 'New password must be at least 6 characters' })
	@NotMatch('password', { message: 'New password must be different from the current password' })
	newPassword: string;

	@IsNotEmpty({ message: 'Confirm new password is required' })
	@IsString({ message: 'Confirm new password must be a string' })
	@Match('newPassword', { message: 'Confirm new password must be equal to new password' })
	confirmNewPassword: string;
}
