import { User } from "../user-parser/user.parser";

export function merge(users: User[], menus: string[]): { users: MergedUser[] } {
    return { users: users.map((user, userIndex) => ({
        userName: user.userName,
        menuItems: user.menuItems.reduce((acc, hasPermission, index) => {
            if(index >= menus.length) 
                throw new Error(`User [${ userIndex }] "${ user.userName }" has more permissions than there are menu items`);
            if(!hasPermission) return acc;
            return [...acc, menus[index]];
        }, [] as string[]),
    })) };
}

type MergedUser = {
    userName: string;
    menuItems: string[];
}