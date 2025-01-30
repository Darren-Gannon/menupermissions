import { parseUsersStr } from "./user.parser";

describe('UserParser', () => {
    it('should parse a user a string', () => {
        const usersStr = 'User1 NYNYN NNNNY';
        expect(parseUsersStr(usersStr)).toEqual([{ userName: 'User1', menuItems: [
            false, true, false, true, false,
            false, false, false, false, true,
        ] }]);
    })

    it('should fail because of strictness', () => {
        const usersStr = 'User1 NYNYNNNNNY';
        expect(() => {
            parseUsersStr(usersStr, { strictFormatting: true });
        }).toThrow();
    })

    it('should fail because of a lower case n', () => {
        const usersStr = 'User1 NYNYNnNNNY';
        expect(() => {
            parseUsersStr(usersStr, { strictFormatting: true });
        }).toThrow();
    })

    it('should parse with lower case values', () => {
        const usersStr = 'User1 NYNyNnNNNY';
        expect(parseUsersStr(usersStr)).toEqual([
            {
                userName: 'User1', 
                menuItems: [
                    false, true, false, true, false,
                    false, false, false, false, true,
                ]
            },
        ]);
    })

    it('should parse weak format', () => {
        const usersStr = 'User1 NYNYNNNNNY';
        expect(parseUsersStr(usersStr, { strictFormatting: false })).toEqual([
            {
                userName: 'User1', 
                menuItems: [
                    false, true, false, true, false,
                    false, false, false, false, true,
                ]
            },
        ]);
    })
});