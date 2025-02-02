import { merge } from './merge';

describe('Merge', () => {
    it('should merge a basic list of users with a basic list of permissions', () => {
        const users = [
            { userName: 'user1', menuItems: [true, false, true] },
            { userName: 'user2', menuItems: [false, true, false] },
        ];
        const menus = ['menu1', 'menu2', 'menu3'];
        const result = merge(users, menus, {});
        expect(result).toEqual({
            users: [
                { userName: 'user1', menuItems: ['menu1', 'menu3'] },
                { userName: 'user2', menuItems: ['menu2'] },
            ],
        });
    });
});