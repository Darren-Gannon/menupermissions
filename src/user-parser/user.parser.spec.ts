import { parseUsersStr } from "./user.parser";

describe('UserParser', () => {
    it('should parse a user a string', () => {
        const usersStr = 'User1 NYNYN NNNNY';
        expect(parseUsersStr(usersStr)).toEqual([{ userName: 'User1', menuItems: [
            false, true, false, true, false,
            false, false, false, false, true,
        ] }]);
    })

    it('should parse a user a string with a comma delimiter', () => {
        const usersStr = 'User1,NYNYN,NNNNY';
        expect(parseUsersStr(usersStr, { fieldDelimiter: ',' })).toEqual([{ userName: 'User1', menuItems: [
            false, true, false, true, false,
            false, false, false, false, true,
        ] }]);
    })

    it('should fail because of strict formatting', () => {
        const usersStr = 'User1 NYNYNNNNNY';
        expect(() => {
            parseUsersStr(usersStr, { strictFormatting: true });
        }).toThrow();
    })

    it('should fail because of an invadid character', () => {
        const usersStr = 'User1 NYNYN aNNNY';
        expect(() => {
            parseUsersStr(usersStr);
        }).toThrow("Invalid permission value. Expected permission segment to be either 'Y' or 'N', but got a on permission segment 6");
    })

    it('should parse with lower case values', () => {
        const usersStr = 'User1 NYNyNnNNNY';
        expect(parseUsersStr(usersStr, { strictPermissionValues: false })).toEqual([
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
    });

    it('should parse a list of users with a line delimiter', () => {
        const usersStr = ['User1 NYNYN NNNNY', 'UserBob NNYNN NNNYY'].join('\n');
        expect(parseUsersStr(usersStr, { lineDelimiter: '\n' })).toEqual([{ 
            userName: 'User1', menuItems: [
                false, true, false, true, false,
                false, false, false, false, true,
            ] 
        }, {
            userName: 'UserBob', menuItems: [
                false, false, true, false, false,
                false, false, false, true, true,
            ]
        }]);
    })
});