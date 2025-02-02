import { EOL } from "node:os";
import { parseMenusStr } from "./menu.parser";

describe('MenuParser', () => {

    it('should parse a menu string', () => {
        expect(parseMenusStr(`
            1, Applications Menu
            2, Security Permissions Menu
            3, Customers Menu
            4, Accounts Menu
            6, Settings Menu
            5, Pricing Menu
            7, Orders Menu
            8, Jobs Menu
            9, Profile Menu
            10, Help Menu
        `, { lineDelimiter: '\n' })).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Pricing Menu',
            'Settings Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });

    it('should parse a menu string with a comma in the name', () => {
        expect(parseMenusStr(`
            1, Applications Menu
            2, Security Permissions Menu
            3, Customers Menu
            4, Accounts Menu
            6, Settings Menu
            5, Pricing, Products Menu
            7, Orders Menu
            8, Jobs Menu
            9, Profile Menu
            10, Help Menu
        `, { lineDelimiter: '\n' })).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Pricing, Products Menu',
            'Settings Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });

    it('should parse the menu string despite gaps', () => {
        expect(parseMenusStr(`
            1, Applications Menu
            2, Security Permissions Menu

            3, Customers Menu
            4, Accounts Menu
            6, Settings Menu
            5, Pricing Menu
            7, Orders Menu
            8, Jobs Menu
            9, Profile Menu
            10, Help Menu
        `, { lineDelimiter: '\n' })).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Pricing Menu',
            'Settings Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });

    it('should parse the menu without numbers', () => {
        expect(parseMenusStr(`
            Applications Menu
            Security Permissions Menu
            Customers Menu
            Accounts Menu
            Settings Menu
            Pricing Menu
            Orders Menu
            Jobs Menu
            Profile Menu
            Help Menu
        `, { lineDelimiter: '\n' })).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Settings Menu',
            'Pricing Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });

    it('should parse the menu without numbers and with gaps', () => {
        expect(parseMenusStr(`
            Applications Menu
            Security Permissions Menu
            Customers Menu

            Accounts Menu
            Settings Menu
            Pricing Menu
            Orders Menu
            Jobs Menu
            Profile Menu
            Help Menu
        `, { lineDelimiter: '\n' })).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Settings Menu',
            'Pricing Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });

    it('should throw an error parsing the menu without numbers', () => {
        expect(() => {
            parseMenusStr(`
                Applications Menu
                Security Permissions Menu
                Customers Menu
                Accounts Menu
                Settings Menu
                Pricing Menu
                Orders Menu
                Jobs Menu
                Profile Menu
                Help Menu
            `, { lineDelimiter: '\n', strictIndexing: true });
        }).toThrow('Invalid menu item on line 1. Expected an index');
    });

    it('should parse a menu with a custom line delimiter', () => {
        expect(parseMenusStr([
            "1, Applications Menu",
            "2, Security Permissions Menu",
            "3, Customers Menu",
            "4, Accounts Menu",
            "6, Settings Menu",
            "5, Pricing Menu",
            "7, Orders Menu",
            "8, Jobs Menu",
            "9, Profile Menu",
            "10, Help Menu",
        ].join(EOL))).toEqual([
            'Applications Menu',
            'Security Permissions Menu',
            'Customers Menu',
            'Accounts Menu',
            'Pricing Menu',
            'Settings Menu',
            'Orders Menu',
            'Jobs Menu',
            'Profile Menu',
            'Help Menu',
        ]);
    });
});