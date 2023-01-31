import { makeAutoObservable, toJS } from "mobx";
import axios from "axios";
import { IUser } from "../models/IUser";
import { AuthService } from "../services/auth.service";
import { AuthResponse } from "../models/response/auth.response";

export default class AuthStore {
    user = {} as IUser;
    isAuth = false;
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    SetUser(user: IUser) {
        this.user = user;
    }

    SetAuth(isAuth: boolean) {
        this.isAuth = isAuth;
    }

    SetLoading(isLoading: boolean) {
        this.isLoading = isLoading;
    }

    async SignIn(username_or_email: string, password: string) {
        try {
            const response = await AuthService.SignIn(username_or_email, password);
            const data = response.data.userData;
            console.log(data);
            localStorage.setItem("token", data.AccessToken);
            this.SetAuth(true);
            this.SetUser(data.User);
            return "Signed In";
        }
        catch (error) {
            console.error(error);
            return `Invalid user data!`
        }
    }

    async SignUp(username: string, email: string, password: string) {
        try {
            const response = await AuthService.SignUp(username, email, password);
            const data = response.data.userData;
            localStorage.setItem("token", data.AccessToken);
            this.SetAuth(true);
            this.SetUser(data.User);
            return "Signed Up";
        }
        catch (error) {
            console.error(error);
            return `Invalid user data!`
        }
    }

    async Logout() {
        try {
            await AuthService.Logout();
            localStorage.removeItem("token");
            this.SetAuth(false);
            this.SetUser({} as IUser);
        }
        catch (error) {
            console.error(error);
        }
    }

    async CheckAuth() {
        this.SetLoading(true);
        try {
            const response = await axios.get<AuthResponse>("http://localhost:9001/api/auth/refresh", { withCredentials: true });
            localStorage.setItem("token", response.data.userData.AccessToken);
            this.SetAuth(true);
            this.SetUser(response.data.userData.User);
        } catch (error) {
            console.error(error);
        } finally {
            this.SetLoading(false);
        }
    }
}