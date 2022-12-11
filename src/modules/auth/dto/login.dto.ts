import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@IsNotEmpty({ message: 'Email is required'})
	@IsString({ message: 'Email must be a string'})
	@IsEmail({}, { message: 'Invalid email' })
	email: string;

	@IsNotEmpty({ message: 'Password is required'})
	@IsString({ message: 'Password must be a string'})
	password: string;
}
