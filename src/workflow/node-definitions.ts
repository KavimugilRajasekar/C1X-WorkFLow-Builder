import { NodeDefinition } from './types';

export const defaultNodeDefinitions: NodeDefinition[] = [
  // Triggers
  { type: 'ad_click', label: 'Ad Clicked', icon: 'MousePointer', category: 'trigger', configFields: ['campaign_id', 'ad_id'] },
  { type: 'impression', label: 'Ad Impression', icon: 'Eye', category: 'trigger', configFields: ['campaign_id'] },
  { type: 'purchase', label: 'Purchase', icon: 'ShoppingCart', category: 'trigger', configFields: ['min_amount'] },
  { type: 'signup', label: 'User Signup', icon: 'UserPlus', category: 'trigger', configFields: ['source'] },
  { type: 'abandoned_cart', label: 'Abandoned Cart', icon: 'ShoppingCart', category: 'trigger', configFields: ['wait_minutes'] },
  { type: 'page_visit', label: 'Page Visit', icon: 'Globe', category: 'trigger', configFields: ['url_pattern'] },
  { type: 'ctr_threshold', label: 'CTR Below Threshold', icon: 'TrendingDown', category: 'trigger', configFields: ['threshold_percent'] },

  // Actions
  { type: 'show_ad', label: 'Show Ad', icon: 'Tv', category: 'action', configFields: ['ad_id', 'bid_amount', 'target_audience'] },
  { type: 'send_email', label: 'Send Email', icon: 'Mail', category: 'action', configFields: ['template_id', 'subject'] },
  { type: 'send_sms', label: 'Send SMS', icon: 'MessageSquare', category: 'action', configFields: ['template_id', 'phone_field'] },
  { type: 'push_notification', label: 'Push Notification', icon: 'Bell', category: 'action', configFields: ['title', 'body'] },
  { type: 'webhook', label: 'Webhook', icon: 'Webhook', category: 'action', configFields: ['url', 'method', 'payload'] },
  { type: 'add_to_audience', label: 'Add to Audience', icon: 'Users', category: 'action', configFields: ['audience_id'] },
  { type: 'remove_from_audience', label: 'Remove from Audience', icon: 'UserMinus', category: 'action', configFields: ['audience_id'] },
  { type: 'pause_campaign', label: 'Pause Campaign', icon: 'PauseCircle', category: 'action', configFields: ['campaign_id'] },
  { type: 'adjust_bid', label: 'Adjust Bid', icon: 'DollarSign', category: 'action', configFields: ['new_bid_amount', 'direction'] },
  { type: 'notify_team', label: 'Notify Team', icon: 'BellRing', category: 'action', configFields: ['slack_channel', 'email'] },
  { type: 'crm_update', label: 'Update CRM', icon: 'Database', category: 'action', configFields: ['field', 'value'] },

  // Logic
  { type: 'delay', label: 'Delay', icon: 'Clock', category: 'logic', configFields: ['duration', 'unit'] },
  { type: 'condition', label: 'If/Else', icon: 'GitBranch', category: 'logic', configFields: ['condition_type', 'field', 'operator', 'value'] },
  { type: 'split', label: 'A/B Test', icon: 'Split', category: 'logic', configFields: ['percentage_a', 'percentage_b'] },
  { type: 'filter', label: 'Filter', icon: 'Filter', category: 'logic', configFields: ['field', 'operator', 'value'] },
  { type: 'wait_for_event', label: 'Wait for Event', icon: 'Hourglass', category: 'logic', configFields: ['event_type', 'timeout_hours'] },
];

export const categoryColors: Record<string, { accent: string; bg: string; label: string }> = {
  trigger: { accent: 'hsl(142, 60%, 50%)', bg: 'hsl(142, 60%, 12%)', label: 'Triggers' },
  action: { accent: 'hsl(200, 95%, 55%)', bg: 'hsl(200, 95%, 10%)', label: 'Actions' },
  logic: { accent: 'hsl(35, 95%, 55%)', bg: 'hsl(35, 95%, 10%)', label: 'Logic' },
};
