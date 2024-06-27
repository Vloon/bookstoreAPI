class User {
    username: string;
    hashedPassword: string;

    constructor(username: string, hashedPassword: string) {
        this.username = username;
        this.hashedPassword = hashedPassword;
    }
}