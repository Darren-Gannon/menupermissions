import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { readFile } from 'node:fs/promises';
import { parseUsersStr } from './user-parser/user.parser';
import { parseMenusStr } from './menu-parser/menu.parser';
import { merge } from './merge/merge';

(async () => {
    const options = commandLineArgs([
        { name: 'userfile', alias: 'u', type: String, multiple: true },
        { name: 'menufile', alias: 'm', type: String, multiple: true },
        { name: 'files', type: String, multiple: true, defaultOption: true },
        { name: 'strict', alias: 's', type: Boolean },
        { name: 'strictMenuIndexing', type: Boolean },
        { name: 'strictUserFileFormatting', type: Boolean },
        { name: 'userLineDelimiter', type: String },
        { name: 'userFieldDelimiter', type: String },
        { name: 'strictUserPermissionValues', type: Boolean },
        { name: 'allowEmptyMenuItems', type: Boolean },
        { name: 'ensureMenuItems', type: Boolean },
        { name: 'lineDelimiter', type: String },
        { name: 'menuLineDelimiter', type: String },
        { name: 'help', alias: 'h', type: Boolean },
    ], {});

    if ((options.help) || Object.keys(options).length === 0) {
        const sections = [
            {
                header: 'Chillisoft Reverse Engineer Task',
                content: 'Merges the permissions of a list of users and menus into a single JSON output.'
            },
            {
                header: 'Usage',
                content: '$ node src/index.ts -u user1.txt user2.txt -m menu1.txt menu2.txt\n$ node src/index.ts --files user1.txt menu1.txt\n$ node src/index.ts -u user1.txt -m menu1.txt\n$ node src/index.ts user1.txt menu1.txt'
            },
            {
                header: 'Options',
                optionList: [
                    {
                        name: 'userfile',
                        alias: 'u',
                        typeLabel: '{underline file[]}',
                        description: 'The list of filenames of usernames-permissions files.\n* It must be used in combonation with menufile.\n* It cannot be used in combonation with files.'
                    },
                    {
                        name: 'menufile',
                        alias: 'm',
                        typeLabel: '{underline file[]}',
                        description: 'The filename of the menu file.\n* It must be used in combonation with userfile.\n* It cannot be used in combonation with files.'
                    },
                    {
                        name: 'files',
                        typeLabel: '{underline [file, file]}',
                        description: 'The list of filenames of usernames-permissions file and menu file.\n* It must be in the order user file, menu file.\n* It must be a length of 2.\n* It cannot be used with userfile or menufile.'
                    },
                    {
                        name: 'strict',
                        alias: 's',
                        typeLabel: '{underline boolean}',
                        description: 'Enables strict formatting for both user and menu files.\ndefault: {italic false}\nSee Also: {underline stringMenuIndexing}'
                    },
                    {
                        name: 'strictMenuIndexing',
                        typeLabel: '{underline boolean}',
                        description: 'Enforces indexing for menu files.\ndefault: {italic false}'
                    },
                    {
                        name: 'strictUserFileFormatting',
                        typeLabel: '{underline boolean}',
                        description: 'Enforces the format [username] [5 permissions] [5 permissions] ... for user files.\ndefault: {italic false}'
                    },
                    {
                        name: 'strictUserPermissionValues',
                        typeLabel: '{underline boolean}',
                        description: 'Enforces permission values of Y and N, otherwise allows y and n.\ndefault: {italic false}'
                    },
                    {
                        name: 'lineDelimiter',
                        typeLabel: '{underline string}',
                        description: 'Line delimiter for files.\nSee Also: {underline menuLineDelimiter}'
                    },
                    {
                        name: 'menuLineDelimiter',
                        typeLabel: '{underline string}',
                        description: 'Line delimiter for menu files, supercedes lineDelimiter option.\ndefault: {italic OS EOL}\nSee Also: {underline lineDelimiter}'
                    },
                    {
                        name: 'userLineDelimiter',
                        typeLabel: '{underline string}',
                        description: 'Line delimiter for user files, supercedes lineDelimiter option.\ndefault: {italic OS EOL}\nSee Also: {underline lineDelimiter}'
                    },
                    {
                        name: 'userFieldDelimiter',
                        typeLabel: '{underline string}',
                        description: 'Field delimiter for user files.\ndefault: {italic space}'
                    },
                    {
                        name: 'allowEmptyMenuItems',
                        typeLabel: '{underline boolean}',
                        description: 'Determines whether empty menu items are allowable.\ndefault: {italic false}'
                    },
                    
                    {
                        name: 'help',
                        alias: 'h',
                        description: 'Print this usage guide.'
                    },
                ]
            }
        ]
        const usage = commandLineUsage(sections)
        console.log(usage)
        return;
    }

    if(options.files) {
        if(options.userfile?.length > 0 || options.menufile?.length > 0)
            throw new Error('Cannot use files option with userfile or menufile');
        if(options.files.length !== 2) 
            throw new Error('Files option must be a length of 2');
    }

    const [userFiles, menuFiles] = ((): [string[], string[]] => {
        if((options.files?.length ?? 0) > 0) {
            return [[options.files[0]], [options.files[1]]];
        }
        return [options.userfile as string[], options.menufile as string[]];
    })()

    if((userFiles?.length ?? 0) == 0)
        throw new Error('No user files provided');

    if((menuFiles?.length ?? 0) == 0)
        throw new Error('No menu files provided');

    const menusPromise = Promise.all(menuFiles.map(async file => {
        const menuStr = await readFile(file, 'utf-8');
        return parseMenusStr(menuStr, {
            strictIndexing: options.strictMenuIndexing ?? options.strict,
            lineDelimiter: options.menuLineDelimiter ?? options.lineDelimiter
        });
    })).then(menus => menus.reduce((acc, menu) => [...acc, ...menu], []));

    const usersPromise = Promise.all(userFiles.map(async file => {
        const userStr = await readFile(file, 'utf-8');
        return parseUsersStr(userStr, {
            strictFormatting: options.strictUserFileFormatting ?? options.strict,
            fieldDelimiter: options.userFieldDelimiter,
            lineDelimiter: options.userLineDelimiter ?? options.lineDelimiter,
            strictPermissionValues: options.strictUserPermissionValues ?? options.strict,
        });
    })).then(users => users.flat());

    const [menus, users] = await Promise.all([menusPromise, usersPromise]);

    console.log(JSON.stringify(merge(users, menus, { 
        allowEmptyMenuItems: options.allowEmptyMenuItems ?? options.strict,
        ensureMenuItems: options.ensureMenuItems ?? options.strict,
    }), null, 2));
})().catch(err => {
    console.error(`[${ new Date().toISOString() }] Error: ${err.message}`);
    process.exit(1);
});
