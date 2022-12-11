import { AbstractEntity } from "@/common/abstracts/entity.abstract";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { UserPermission } from "./user-permission.entity";
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User extends AbstractEntity {
	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	avatar: string;

	@Column({ nullable: true })
	lastChangePassword: Date;

	@Column({ nullable: true })
	passwordResetToken: string;

	@OneToMany(() => UserPermission, permission => permission.user)
	permissions: UserPermission;

	@BeforeInsert()
	@BeforeUpdate()
	hashPassword() {
		if (this.password) {
			this.password = bcrypt.hashSync(this.password, 8);
		}
	}

	checkPassword(password: string) {
		return bcrypt.compareSync(password, this.password);
	}

	toJSON() {
		const obj = { ...this };
		delete obj.password;
		delete obj.passwordResetToken;

		return obj;
	}
}
