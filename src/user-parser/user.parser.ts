import { EOL } from 'node:os';

export function parseUsersStr(usersStr: string, config?: Partial<{
    lineDelimiter: string;
    fieldDelimiter: string;
    strictFormatting: boolean;
    strictPermissionValues: boolean;
}>): User[] {
  return usersStr.split(config?.lineDelimiter ?? EOL).map(userStr => {
    const [userName, ..._permissions] = userStr.split(config?.fieldDelimiter ?? ' ');

    if(config?.strictFormatting) {
        _permissions.forEach((permission, index) => {
            if(permission.length !== 5)
                throw new Error(`Invalid permission format. Expected permission segment to be 5 characters long, but got ${ permission.length } on permission segment ${ index + 1 }`);
        })
    }

    const permissions = _permissions.join('');

    const menuItems = permissions.split('').map((permission, index) => {
        if(config?.strictPermissionValues) {
            if(!['Y', 'N'].includes(permission))
                throw new Error(`Invalid permission value. Expected permission segment to be either 'Y' or 'N', but got ${ permission } on permission segment ${ index + 1 }`);
        }
        permission = permission.toUpperCase();
        if(permission === 'Y') return true;
        else if(permission === 'N') return false;
        else throw new Error(`Invalid permission value. Expected permission segment to be either 'Y' or 'N', but got ${ permission } on permission segment ${ index + 1 }`);
    });


    return { userName, menuItems };
  });
}

export type User = {
    userName: string;
    menuItems: boolean[];
}