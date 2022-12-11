import { AbstractEntity } from "@/common/abstracts/entity.abstract";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity('user_permissions')
export class UserPermission extends AbstractEntity {
	@Column()
	route: string;

	@Column({ default: false })
	create: boolean;

	@Column({ default: false })
	read: boolean;

	@Column({ default: false })
	update: boolean;

	@Column({ default: false })
	delete: boolean;

	@ManyToOne(() => User, user => user.permissions)
	user: User;

	toJSON() {
		const obj = { ...this };
		delete obj.id;
		delete obj.createdAt;
		delete obj.updatedAt;

		return obj;
	}
}
