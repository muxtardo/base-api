import { Exists } from "@/common/decorators/validators/exists.decorator";
import { User } from "@/database/entities/user.entity";
import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto extends PartialType(User) {
	@IsNotEmpty({ message: 'Name is required' })
	@IsString({ message: 'Name must be a string' })
	@MinLength(3, { message: 'Name must be at least 3 characters' })
	name: string;

	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail({}, { message: 'Invalid email' })
	@Exists(User, 'email', { message: 'Email already exists' })
	email: string;
}
