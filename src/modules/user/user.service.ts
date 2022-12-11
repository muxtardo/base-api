import { SearchDto } from "@/common/dtos/search.dto";
import { FilesService } from "@/common/services/files.service";
import { User } from "@/database/entities/user.entity";
import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { FindOptionsWhere, Repository } from "typeorm";
import { MailService } from "../mail/mail.service";
import { ChangeUserPasswordDto } from "./dto/change-user-password.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
	private logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly mailService: MailService,
		private readonly filesService: FilesService
	) {}

	async create(createUserDto: CreateUserDto) {
		// Generate a random password
		const password = User.randomString();

		// Create a new user
		const newUser: User = this.userRepository.create({ ...createUserDto, password });

		// Log user creation
		this.logger.debug(`New user created with data: ${JSON.stringify(newUser)}`);

		// Save user in database
		await this.userRepository.save(newUser);

		// Send welcome email
		this.mailService.sendWelcome(newUser, password);

		return newUser;
	}

	async find({ page = 1, limit = 10, filter, relations }: SearchDto) {
		const criteria = User.createFilter<User>(filter);
		return User.pagination<User>(this.userRepository, page, limit, criteria, relations);
	}

	async findBy(criteria: FindOptionsWhere<User>, page = 1, limit = 10, relations?: string[]) {
		return User.pagination<User>(this.userRepository, page, limit, criteria, relations);
	}

	findById(id: number, relations?: string[]) {
		return this.userRepository.findOne({
			where: { id },
			relations
		});
	}

	findOneBy(criteria: FindOptionsWhere<User>, relations?: string[]) {
		return this.userRepository.findOne({
			where: criteria,
			relations
		});
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return this.userRepository.update(id, updateUserDto);
	}

	delete(id: number) {
		return this.userRepository.delete(id);
	}

	async avatar(id: number, res: Response) {
		const user = await this.findById(id);
		if (!user) throw new NotFoundException('User not found');
		if (!user?.avatar) throw new UnprocessableEntityException('Avatar not found');

		// Get avatar file from storage
		const file = await this.filesService.loadFile(user.avatar);
		res.contentType(file.ContentType);
		res.send(file.Body);

		return;
	}

	async changePassword({ password, newPassword }: ChangeUserPasswordDto, user: User) {
		if (user.checkPassword(password)) throw new UnprocessableEntityException('Invalid current password');

		// Update user password
		await this.update(user.id, {
			password: newPassword,
			passwordResetToken: null,
			lastChangePassword: new Date()
		});

		return user;
	}

	async changeAvatar(avatar: Express.Multer.File, user: User) {
		// Check file type
		const mimetypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
		if (!mimetypes.includes(avatar.mimetype)) throw new UnprocessableEntityException('Invalid file type');

		// Check file size
		if (avatar.size > 1024 * 1024 * 3) throw new UnprocessableEntityException('File size must be less than 3MB');

		// Upload avatar file
		const upload = await this.filesService.uploadFile(avatar, 'avatar');

		// Delete old avatar
		if (user.avatar) await this.filesService.deleteFile(user.avatar);

		// Update user avatar
		await this.update(user.id, { avatar: upload.Key });

		return user;
	}
}
