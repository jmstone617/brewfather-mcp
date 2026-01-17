export interface ToolHandler {
    name: string;
    description: string;
    inputSchema: object;

    run(input: any): Promise<any>;
}