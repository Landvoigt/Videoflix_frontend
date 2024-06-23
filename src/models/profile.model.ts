export class Profile {
    id?: number;
    user?: any;
    name: string;
    description?: string;
    avatar_id: number;
    creation_date?: any;

    constructor(name: string, avatar_id: number, id?: number) {
        this.name = name;
        this.avatar_id = avatar_id;
        if (id) {
            this.id = id;
        }
    }
}

export const ProfileImages: any[] = [
    "/assets/img/profile-images/profile_1.png",
    "/assets/img/profile-images/profile_2.png",
    "/assets/img/profile-images/profile_3.png",
    "/assets/img/profile-images/profile_4.png",
    "/assets/img/profile-images/profile_5.png",
    "/assets/img/profile-images/profile_6.png",
    "/assets/img/profile-images/profile_7.png",
];