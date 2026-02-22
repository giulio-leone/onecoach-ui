'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { logger } from '@giulio-leone/lib-shared';
export interface SystemPrompt {
  agentId: string;
  category: string;
  name: string;
  description: string | null;
  isActive: boolean;
  promptTemplate: string | null;
  defaultPrompt: string;
  variables: Record<string, { type: string; description: string; required: boolean }>;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function usePromptsManager() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
      const response = await fetch(`/api/admin/prompts${categoryParam}`);
      if (!response.ok) throw new Error('Failed to load prompts');
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      logger.error('Failed to load prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const togglePrompt = async (agentId: string, currentStatus: boolean) => {
    const prompt = prompts.find((p: any) => p.agentId === agentId);
    if (!prompt) return;

    const newStatus = !currentStatus;
    const newTemplate = prompt.promptTemplate || prompt.defaultPrompt;

    try {
      const response = await fetch(`/api/admin/prompts/${encodeURIComponent(agentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTemplate: newTemplate,
          isActive: newStatus,
          changeReason: `Toggle ${newStatus ? 'enabled' : 'disabled'} custom prompt`,
        }),
      });

      if (!response.ok) throw new Error('Failed to update prompt');

      setPrompts((prev) =>
        prev.map((p: any) => (p.agentId === agentId ? { ...p, isActive: newStatus } : p))
      );
      toast.success(`Prompt ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      logger.error('Failed to toggle prompt:', error);
      toast.error('Failed to toggle prompt');
    }
  };

  const savePrompt = async (agentId: string, template: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/prompts/${encodeURIComponent(agentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTemplate: template,
          isActive,
          changeReason: 'Updated via admin dashboard',
        }),
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      setPrompts((prev) =>
        prev.map((p: any) => (p.agentId === agentId ? { ...p, promptTemplate: template, isActive } : p))
      );
      toast.success('Prompt saved successfully');
    } catch (error) {
      logger.error('Failed to save prompt:', error);
      toast.error('Failed to save prompt');
      throw error;
    }
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      const matchesSearch =
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.agentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [prompts, selectedCategory, searchQuery]);

  const selectedPrompt = prompts.find((p: any) => p.agentId === selectedPromptId) || null;

  return {
    prompts,
    filteredPrompts,
    loading,
    selectedCategory,
    setSelectedCategory,
    selectedPromptId,
    setSelectedPromptId,
    selectedPrompt,
    searchQuery,
    setSearchQuery,
    togglePrompt,
    savePrompt,
    refreshPrompts: loadPrompts,
  };
}
