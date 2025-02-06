import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository  extends AbstractRepository<User> {
}