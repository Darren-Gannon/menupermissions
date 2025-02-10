import fs from 'fs';
import fsp from 'fs/promises';
import readline from 'readline/promises';

const lineCoder = {
    encode: (line: string) => `${ line.replace(/\|/, '||') }|`,
    decode: (line: string) => {
        if(line[line.length - 1] !== '|') {
            throw new Error('Invalid line');
        }
        return line.slice(0, -1).replace(/\|\|/, '|');
    }
}

export async function merge(userFilename: string, menuFilename: string): Promise<void> {
    // scan permission name length

    const PERMISSION_REGEX = /^(\d+),\s(.+)$/;
    const largestLineLength = await (async () => {
        let max = 0;
        const menuLineStream = readline.createInterface({
            input: fs.createReadStream(menuFilename)
        });

        return new Promise<number>((resolve, reject) => {
            menuLineStream.on('line', line => {
                const test = PERMISSION_REGEX.exec(line);
                if(!test) {
                    reject(new Error(`Invalid line: "${line}"`))
                    return;
                };
                const [_, index, name] = test;
                max = Math.max(max, lineCoder.encode(name).length);
            });
            menuLineStream.on('close', () => {
                resolve(max);
            });
        });
    })();

    await fsp.mkdir('temp', { recursive: true });
    const filename = `temp/${process.pid}.raf`;
    const fd = await fsp.open(filename, 'w');

    const menuLineStream = readline.createInterface({
        input: fs.createReadStream(menuFilename)
    });

    await new Promise<void>((resolve, reject) => {
        menuLineStream.on('line', line => {
            const buffer = Buffer.alloc(largestLineLength);
            const test = PERMISSION_REGEX.exec(line)!;
            const [_, index, name] = test;
            const encoded = Buffer.from(lineCoder.encode(name).padEnd(largestLineLength, ' '));
            encoded.copy(buffer);
            fs.write(fd.fd, buffer, 0, encoded.length, (+index - 1) * largestLineLength, err => {
                if(err) {
                    reject(err);
                }
            })
        });

        menuLineStream.on('close', () => {
            resolve();
        });
    })

    await fd.close();
    const fd2 = await fsp.open(filename, 'r');

    process.stdout.write("{\n");
    process.stdout.write("  \"users\": [\n");
    const userStream = fs.createReadStream(userFilename, {
        encoding: 'utf8',
    });

    let openUser: boolean = false;
    let foundUsername: boolean = false;
    let menuIndex: number = 0;
    let hasPopulatedPermissions: boolean = false;
    userStream.on('readable', () => {
        let chunk;
        while (null !== (chunk = userStream.read(1) /* here */)) {
            if(!openUser) {
                process.stdout.write("    {\n");
                process.stdout.write("      \"userName\": \"");
                openUser = true;
                foundUsername = false;
            } 

            // Read chunk
            if(chunk === "\n") {
                process.stdout.write("\n      ]\n    },\n");
                openUser = false;
                menuIndex = 0;
                hasPopulatedPermissions = false;
            } else if(chunk == ' ') {
                if(!foundUsername) {
                    process.stdout.write("\",\n      \"menuItems\": [");
                    foundUsername = true;
                    menuIndex = 0;
                    hasPopulatedPermissions = false;
                }
            } else if(!foundUsername) {
                process.stdout.write(chunk);
            } else if(['Y', 'N'].includes(chunk)) {
                if(chunk === 'Y') {
                    const buffer = Buffer.alloc(largestLineLength);
                    const permission = fs.readSync(fd2.fd, buffer, 0, largestLineLength, menuIndex * largestLineLength);
                    process.stdout.write(`${!hasPopulatedPermissions ? '' : ','}\n        "${ lineCoder.decode(buffer.toString().trimEnd()) }"`);
                    hasPopulatedPermissions = true;
                }
                menuIndex++;
            }
        }
    });
    userStream.on('end', () => {
        process.stdout.write("\n      ]\n    },\n  ]\n}\n");
        fd2.close()
            .then(() => fsp.unlink(filename))
            .then(() => fsp.rmdir('temp').catch());
    });
}

merge('e2e/files/users.txt', 'e2e/files/menus.txt');