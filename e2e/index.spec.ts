import { spawn } from "node:child_process";
import path from "node:path";
import { readFile } from 'node:fs/promises';

describe('End-to-end tests', () => {
    const scriptPath = path.resolve("dist", "index.js");

    it('should merge the list of users with the list of permissions and match the output', async () => {
        const args = ["e2e/files/users.txt", "e2e/files/menus.txt"];
        const outputFile = "e2e/files/output.json";
        const expectedOutput = await readFile(outputFile, "utf-8");
        const child = spawn("node", [scriptPath, ...args]);
        
        const { output, code } = await new Promise<{ output: string, code: number | null }>((resolve) => {

            let output = "";
            child.stdout.on("data", (data) => {
              output += data.toString();
            });
    
    
        
            child.on("close", (code) => {
              resolve({output, code});
            });
        });
        expect(code).toEqual(0);
        expect(JSON.parse(output.trim())).toEqual(JSON.parse(expectedOutput.trim()));
    });
})