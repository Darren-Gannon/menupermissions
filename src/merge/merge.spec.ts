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

    describe('Pressure Tests', () => {
        it('should merge a 10000 users with 200 permissions', () => {
            const NUM_USERS = 10000;
            const NUM_MENUS = 200;
            const users = [
                ...new Array(NUM_USERS),
            ].map((_, i) => ({ userName: `user${i}`, menuItems: [true, ...new Array(NUM_MENUS - 1).fill(false)] }));
            const menus = [
                ...new Array(NUM_MENUS),
            ].map((_, i) => `menu${i}`);
            const result = merge(users, menus, {});
            expect(result).toBeDefined();
        });

        it('should merge a large list of users with a large list of permissions', () => {
            const NUM_USERS = 100000;
            const NUM_MENUS = 4000;
            const users = [
                ...new Array(NUM_USERS),
            ].map((_, i) => ({ userName: `user${i}`, menuItems: [true, ...new Array(NUM_MENUS - 1).fill(false)] }));
            const menus = [
                ...new Array(NUM_MENUS),
            ].map((_, i) => `menu${i}`);
            const result = merge(users, menus, {});
            expect(result).toBeDefined();
        });
            
    });

    it('should throw an error due to an insuffienct number of permissions', () => {
        const users = [
            { userName: 'user1', menuItems: [true, false] },
        ];
        const menus = ['menu1', 'menu2', 'menu3'];
        expect(() => {
            merge(users, menus, { ensureMenuItems: true })
        }).toThrow('User "user1" has not been defined with sufficent permissions. Expected 3 but got 2');
    });

    it('should throw an error due to an insuffienct number of menus', () => {
        const users = [
            { userName: 'user1', menuItems: [true, false] },
        ];
        const menus = ['menu1'];
        expect(() => {
            merge(users, menus, { ensureMenuItems: true })
        }).toThrow('User [0] "user1" has more permissions than there are menu items');
    });

    it('should throw an error due to an empty menu', () => {
        const users = [
            { userName: 'user1', menuItems: [true] },
        ];
        const menus = [''];
        expect(() => {
            merge(users, menus, { ensureMenuItems: true })
        }).toThrow('Empty menu item found on menu item 1');
    });
});