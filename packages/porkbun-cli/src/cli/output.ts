import Table from "cli-table3";
import consola from "consola";

export interface TableColumn {
	key: string;
	header: string;
	get?: (row: Record<string, unknown>) => unknown;
}

export type OutputFormat = "json" | "table" | "csv";

const resolveValue = (
	row: Record<string, unknown>,
	col: TableColumn,
): string => {
	const val = col.get ? col.get(row) : row[col.key];
	if (val === null || val === undefined) return "";
	return String(val);
};

const autoColumns = (data: Record<string, unknown>[]): TableColumn[] => {
	const keys = new Set<string>();
	for (const row of data) {
		for (const key of Object.keys(row)) {
			keys.add(key);
		}
	}
	return [...keys].map((key) => ({ key, header: key }));
};

const unwrapData = (data: unknown): Record<string, unknown>[] => {
	if (Array.isArray(data)) return data as Record<string, unknown>[];

	if (data && typeof data === "object") {
		const obj = data as Record<string, unknown>;
		let bestKey = "";
		let bestLen = 0;
		for (const [key, val] of Object.entries(obj)) {
			if (Array.isArray(val) && val.length > bestLen) {
				bestKey = key;
				bestLen = val.length;
			}
		}
		if (bestKey) return obj[bestKey] as Record<string, unknown>[];
	}

	return [data as Record<string, unknown>];
};

const outputTable = (data: unknown, columns?: TableColumn[]) => {
	const rows = unwrapData(data);
	if (rows.length === 0) {
		consola.info("No data to display");
		return;
	}

	const cols = columns ?? autoColumns(rows);
	const table = new Table({
		head: cols.map((c) => c.header),
		style: { head: ["cyan"], border: ["gray"] },
	});

	for (const row of rows) {
		table.push(cols.map((col) => resolveValue(row, col)));
	}

	console.log(table.toString());
};

const escapeCsv = (val: string): string => {
	if (val.includes(",") || val.includes('"') || val.includes("\n")) {
		return `"${val.replace(/"/g, '""')}"`;
	}
	return val;
};

const outputCsv = (data: unknown, columns?: TableColumn[]) => {
	const rows = unwrapData(data);
	if (rows.length === 0) return;

	const cols = columns ?? autoColumns(rows);
	console.log(cols.map((c) => escapeCsv(c.header)).join(","));
	for (const row of rows) {
		console.log(cols.map((col) => escapeCsv(resolveValue(row, col))).join(","));
	}
};

export const output = (
	data: unknown,
	options?: { format?: OutputFormat; columns?: TableColumn[] },
) => {
	const format = options?.format ?? "json";

	switch (format) {
		case "table":
			outputTable(data, options?.columns);
			break;
		case "csv":
			outputCsv(data, options?.columns);
			break;
		default:
			console.log(JSON.stringify(data, null, 2));
	}
};

export const outputError = (error: unknown) => {
	if (error && typeof error === "object" && "toJSON" in error) {
		console.error(
			JSON.stringify((error as { toJSON: () => unknown }).toJSON(), null, 2),
		);
	} else {
		console.error(
			JSON.stringify(
				{
					error: "UnknownError",
					message: error instanceof Error ? error.message : String(error),
				},
				null,
				2,
			),
		);
	}
	process.exit(1);
};
