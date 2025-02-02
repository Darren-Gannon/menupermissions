import { User } from "../user-parser/user.parser";

export function merge(users: User[], menus: string[], config: Partial<{ 
    allowEmptyMenuItems: boolean;
    ensureMenuItems: boolean;
}>): { users: MergedUser[] } {
    if(!config.allowEmptyMenuItems) {
        menus.forEach((menu, index) => {
            if(!menu) throw new Error(`Empty menu item found on menu item ${index + 1}`);
        });
    }
    if(config.ensureMenuItems) {
        for(const user of users) {
            if(user.menuItems.length < menus.length) {
                throw new Error(`User "${ user.userName }" has not been defined with sufficent permissions. Expected ${ menus.length } but got ${ user.menuItems.length }`);
            }
        }
    }
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