import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "porkbun");
const SESSION_FILE = join(CONFIG_DIR, "session.json");

interface Session {
	cookie: string;
	savedAt: string;
}

export const saveSession = (cookie: string) => {
	mkdirSync(CONFIG_DIR, { recursive: true });
	const session: Session = { cookie, savedAt: new Date().toISOString() };
	writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
};

export const loadSession = (): Session | null => {
	if (!existsSync(SESSION_FILE)) return null;
	try {
		return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
	} catch {
		return null;
	}
};

export const clearSession = () => {
	if (existsSync(SESSION_FILE)) rmSync(SESSION_FILE);
};

export const SESSION_PATH = SESSION_FILE;
