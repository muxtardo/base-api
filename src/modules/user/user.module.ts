import { AwsS3Service } from "@/common/services/aws-s3.service";
import { FilesService } from "@/common/services/files.service";
import { User } from "@/database/entities/user.entity";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { MailModule } from "../mail/mail.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		MailModule,
		forwardRef(() => AuthModule),
		TypeOrmModule.forFeature([ User ])
	],
	controllers: [ UserController ],
	providers: [ AwsS3Service, FilesService, UserService ],
	exports: [ UserService ]
})
export class UserModule {}
