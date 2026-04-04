// Main entry point for the library
export { WorkflowEngine } from "./engine/workflow-engine";
export { C1xWorkflowBuilderElement } from "./web-component/c1x-workflow-builder";
export type { WorkflowNode, WorkflowEdge, WorkflowData, Position, NodeDefinition, NodeCategory } from "./workflow/types";
export { defaultNodeDefinitions, categoryColors } from "./workflow/node-definitions";
