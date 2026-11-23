import { IAuthUser } from "../modules/role/role.interface";

declare global {
  namespace Express {
    interface Request {
      user: IAuthUser;
    }
  }
}
