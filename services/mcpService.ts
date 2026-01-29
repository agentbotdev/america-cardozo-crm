
const MCP_URL = 'https://devn8n.agentbott.com/mcp/4536405b-c56f-4cd5-899e-a9a2184bfa26';

export interface McpResponse<T> {
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

export const mcpService = {
    async callTool<T>(toolName: string, args: any = {}): Promise<T> {
        try {
            const response = await fetch(MCP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: `tools/${toolName}`,
                    params: args,
                    id: Date.now(),
                }),
            });

            if (!response.ok) {
                throw new Error(`MCP request failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message || 'Unknown MCP error');
            }

            return data.result as T;
        } catch (error) {
            console.error(`Error calling MCP tool ${toolName}:`, error);
            throw error;
        }
    },

    // Specific Tool Wrappers based on n8n flow
    getDetailedSeries: (metric: string = 'outgoing_messages_count', since?: number, until?: number) =>
        mcpService.callTool('get_detailed_series', { metric, type: 'account', id: '1', since, until }),

    getSummaryTotals: (metric: string = 'conversations_count', since?: number, until?: number) =>
        mcpService.callTool('get_summary_totals', { metric, type: 'account', id: '1', since, until }),

    getAgentPerformance: (since?: number, until?: number) =>
        mcpService.callTool('get_agent_performance', { since, until }),

    getInboxesOverview: (since?: number, until?: number) =>
        mcpService.callTool('get_inboxes_overview', { metric: 'conversations_count', type: 'inbox', id: '1', since, until }),

    getCsatResponses: (since?: number, until?: number) =>
        mcpService.callTool('get_csat_responses', { since, until }),

    getSlaReports: (since?: number, until?: number) =>
        mcpService.callTool('get_sla_reports', { metric: 'sla_missed_count', type: 'account', id: '1', since, until }),

    getBotMetrics: (since?: number, until?: number) =>
        mcpService.callTool('get_bot_metrics', { since, until }),

    getAuditLogs: (page: number = 1) =>
        mcpService.callTool('get_audit_logs', { page }),

    getChannelStats: (since?: number, until?: number) =>
        mcpService.callTool('get_channel_stats', { metric: 'conversations_count', type: 'account', id: '1', since, until }),

    getRawConversations: () =>
        mcpService.callTool('get_raw_conversations', { status: 'all' })
};
