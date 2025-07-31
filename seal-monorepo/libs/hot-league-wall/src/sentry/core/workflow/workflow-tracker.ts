import * as Sentry from '@sentry/react';
import { IWorkflowTracker } from '../interfaces';
import { WorkflowState } from '../sentry-types';

/**
 * Workflow tracker implementation
 * Follows Single Responsibility Principle - only handles workflow tracking
 */
export class WorkflowTracker implements IWorkflowTracker {
    private activeWorkflows: Map<string, { name: string; startTime: number; metadata: Record<string, any> }>;
    private componentName: string;

    constructor(componentName: string) {
        this.activeWorkflows = new Map();
        this.componentName = componentName;
    }

    startWorkflow(workflowId: string, workflowName: string, metadata?: Record<string, any>): void {
        // For now, we'll use breadcrumbs instead of transactions to avoid API compatibility issues
        Sentry.addBreadcrumb({
            category: 'workflow',
            message: `Workflow ${workflowName} started`,
            level: 'info',
            data: {
                workflowId,
                workflowName,
                component: this.componentName,
                metadata
            }
        });

        this.activeWorkflows.set(workflowId, {
            name: workflowName,
            startTime: Date.now(),
            metadata: metadata || {}
        });
    }

    updateWorkflow(workflowId: string, state: string, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            workflow.metadata = { ...workflow.metadata, ...metadata };

            Sentry.addBreadcrumb({
                category: 'workflow',
                message: `Workflow ${workflow.name} updated to ${state}`,
                level: 'info',
                data: {
                    workflowId,
                    state,
                    metadata
                }
            });
        }
    }

    completeWorkflow(workflowId: string, success = true, metadata?: Record<string, any>): void {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            const duration = Date.now() - workflow.startTime;

            Sentry.addBreadcrumb({
                category: 'workflow',
                message: `Workflow ${workflow.name} completed`,
                level: success ? 'info' : 'error',
                data: {
                    workflowId,
                    success,
                    duration,
                    metadata: { ...workflow.metadata, ...metadata }
                }
            });

            this.activeWorkflows.delete(workflowId);
        }
    }

    async trackPerformance<T>(operationName: string, operation: () => Promise<T> | T): Promise<T> {
        const startTime = Date.now();

        Sentry.addBreadcrumb({
            category: 'performance',
            message: `Performance tracking started for ${operationName}`,
            level: 'info',
            data: {
                operationName,
                component: this.componentName,
                startTime
            }
        });

        try {
            const result = await operation();
            const duration = Date.now() - startTime;

            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Performance tracking completed for ${operationName}`,
                level: 'info',
                data: {
                    operationName,
                    component: this.componentName,
                    duration,
                    success: true
                }
            });

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            Sentry.addBreadcrumb({
                category: 'performance',
                message: `Performance tracking failed for ${operationName}`,
                level: 'error',
                data: {
                    operationName,
                    component: this.componentName,
                    duration,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }
            });

            throw error;
        }
    }

    getActiveWorkflows(): Map<string, { name: string; startTime: number; metadata: Record<string, any> }> {
        return new Map(this.activeWorkflows);
    }

    clearWorkflows(): void {
        this.activeWorkflows.clear();
    }
} 