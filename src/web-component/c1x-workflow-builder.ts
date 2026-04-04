import React, { useState, useEffect, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WorkflowEngine } from '../engine/workflow-engine';
import { WorkflowData } from '../workflow/types';

interface C1xWorkflowBuilderAttributes {
  'initial-data'?: string;
  'show-branding'?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'c1x-workflow-builder': C1xWorkflowBuilderElement;
  }
}

export class C1xWorkflowBuilderElement extends HTMLElement {
  private engine: WorkflowEngine;
  private shadow: ShadowRoot;
  private root: Root | null = null;
  private resizeObserver: ResizeObserver | null = null;

  static get observedAttributes() {
    return ['initial-data', 'show-branding'];
  }

  constructor() {
    super();
    this.engine = new WorkflowEngine();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.injectStyles();
    this.mountReactApp();

    this.engine.subscribe(() => {
      this.dispatchEvent(new CustomEvent('onChange', {
        bubbles: true,
        composed: true,
        detail: { workflow: this.engine.exportJSON() },
      }));
    });
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'initial-data' && this.root) {
      try {
        const data = JSON.parse(newValue) as WorkflowData;
        this.engine.importJSON(data);
      } catch {
        console.warn('[c1x-workflow-builder] Invalid initial-data JSON');
      }
    }
  }

  private injectStyles() {
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    this.shadow.appendChild(linkEl);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      *, *::before, *::after {
        box-sizing: border-box;
      }

      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 400px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
      }

      #wc-root {
        width: 100%;
        height: 100%;
      }
    `;
    this.shadow.appendChild(styleEl);
  }

  private mountReactApp() {
    const container = document.createElement('div');
    container.id = 'wc-root';
    this.shadow.appendChild(container);

    this.root = createRoot(container);

    const initialDataAttr = this.getAttribute('initial-data');
    if (initialDataAttr) {
      try {
        const data = JSON.parse(initialDataAttr) as WorkflowData;
        this.engine.importJSON(data);
      } catch {
        // ignore invalid JSON, engine keeps default
      }
    }

    // Dynamic import of the React app to avoid bundling issues
    import('./web-component-app').then(({ WebComponentApp }) => {
      if (this.root) {
        this.root.render(
          React.createElement(WebComponentApp, {
            engine: this.engine,
            showBranding: this.hasAttribute('show-branding') ? this.getAttribute('show-branding') !== 'false' : true,
          })
        );
      }
    });
  }

  // Public API
  exportJSON(): string {
    return JSON.stringify(this.engine.exportJSON(), null, 2);
  }

  importJSON(json: string): boolean {
    try {
      const data = JSON.parse(json) as WorkflowData;
      this.engine.importJSON(data);
      return true;
    } catch {
      return false;
    }
  }

  validate(): { valid: boolean; errors: string[] } {
    return this.engine.validate();
  }

  undo(): boolean {
    return this.engine.undo();
  }

  redo(): boolean {
    return this.engine.redo();
  }

  clear(): void {
    this.engine.clear();
  }

  reset(): void {
    this.engine.reset();
  }

  getEngine(): WorkflowEngine {
    return this.engine;
  }
}

if (!customElements.get('c1x-workflow-builder')) {
  customElements.define('c1x-workflow-builder', C1xWorkflowBuilderElement);
}
