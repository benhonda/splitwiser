import * as fs from 'fs';

interface QueryCache {
	[key: string]: string;
}

export class QueryLoader {
	private cache: QueryCache = {};

	// Load the query from file and cache it in memory
	private loadQueryFromFile(filePath: string): string {
		const query = fs.readFileSync(filePath, 'utf8');
		this.cache[filePath] = query;
		return query;
	}

	// Get the query from the cache or load it from file
	public getQuery(filePath: string): string {
		if (this.cache[filePath]) {
			return this.cache[filePath];
		} else {
			return this.loadQueryFromFile(filePath);
		}
	}

	// Clear the cache
	public clearCache(): void {
		this.cache = {};
	}
}
