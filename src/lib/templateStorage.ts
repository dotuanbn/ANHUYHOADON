// Template Storage Management

import { InvoiceTemplate, DEFAULT_TEMPLATE } from '@/types/template';

const STORAGE_KEY = 'invoice_templates';
const ACTIVE_TEMPLATE_KEY = 'active_template_id';

// Get all templates
export const getTemplates = (): InvoiceTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with default template
      saveTemplates([DEFAULT_TEMPLATE]);
      return [DEFAULT_TEMPLATE];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading templates:', error);
    return [DEFAULT_TEMPLATE];
  }
};

// Get template by ID
export const getTemplateById = (id: string): InvoiceTemplate | null => {
  const templates = getTemplates();
  return templates.find(t => t.id === id) || null;
};

// Get active template
export const getActiveTemplate = (): InvoiceTemplate => {
  try {
    const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (activeId) {
      const template = getTemplateById(activeId);
      if (template) return template;
    }
    // Return default template if no active template
    return getTemplateById('default') || DEFAULT_TEMPLATE;
  } catch (error) {
    console.error('Error loading active template:', error);
    return DEFAULT_TEMPLATE;
  }
};

// Set active template
export const setActiveTemplate = (id: string): void => {
  localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
};

// Save all templates
export const saveTemplates = (templates: InvoiceTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

// Add new template
export const addTemplate = (template: InvoiceTemplate): void => {
  const templates = getTemplates();
  templates.push(template);
  saveTemplates(templates);
};

// Update template
export const updateTemplate = (id: string, updates: Partial<InvoiceTemplate>): void => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTemplates(templates);
  }
};

// Delete template
export const deleteTemplate = (id: string): void => {
  if (id === 'default') {
    throw new Error('Cannot delete default template');
  }
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  saveTemplates(filtered);
  
  // If deleted template was active, switch to default
  const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
  if (activeId === id) {
    setActiveTemplate('default');
  }
};

// Duplicate template
export const duplicateTemplate = (id: string, newName: string): InvoiceTemplate => {
  const template = getTemplateById(id);
  if (!template) {
    throw new Error('Template not found');
  }
  
  const newTemplate: InvoiceTemplate = {
    ...template,
    id: `template_${Date.now()}`,
    name: newName,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  addTemplate(newTemplate);
  return newTemplate;
};

// Export template as JSON
export const exportTemplate = (id: string): string => {
  const template = getTemplateById(id);
  if (!template) {
    throw new Error('Template not found');
  }
  return JSON.stringify(template, null, 2);
};

// Import template from JSON
export const importTemplate = (jsonString: string): InvoiceTemplate => {
  try {
    const template = JSON.parse(jsonString) as InvoiceTemplate;
    template.id = `template_${Date.now()}`;
    template.isDefault = false;
    template.createdAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();
    addTemplate(template);
    return template;
  } catch (error) {
    throw new Error('Invalid template JSON');
  }
};

// Initialize templates
export const initializeTemplates = (): void => {
  const templates = getTemplates();
  if (templates.length === 0) {
    saveTemplates([DEFAULT_TEMPLATE]);
    setActiveTemplate('default');
  }
};

