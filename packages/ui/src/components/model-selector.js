'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Input } from '../input';
import { Select } from '../select';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function ModelSelector({ value, onChange, placeholder = 'Select a model...', className, }) {
    const [models, setModels] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        const fetchModels = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/config/openrouter-models');
                const data = await res.json();
                if (data.success) {
                    setModels(data.models.map((m) => ({
                        id: m.modelId,
                        name: m.name,
                        provider: 'openrouter',
                    })));
                }
            }
            catch (error) {
                console.error('Failed to fetch models', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, []);
    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Filter models
    const filteredModels = models.filter((model) => {
        const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase()) ||
            model.id.toLowerCase().includes(search.toLowerCase());
        const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;
        return matchesSearch && matchesProvider;
    });
    // Unique providers for filter
    const providers = Array.from(new Set(models.map((m) => m.provider))).sort();
    const selectedModel = models.find((m) => m.id === value);
    return (_jsxs("div", { className: cn('relative', className), ref: containerRef, children: [_jsxs("div", { className: "flex w-full cursor-pointer items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300", onClick: () => {
                    setIsOpen(!isOpen);
                    // Focus search input on open if needed, but let's keep it simple
                }, children: [_jsx("span", { className: cn(!selectedModel && 'text-neutral-500'), children: selectedModel ? selectedModel.name : value || placeholder }), _jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })] }), isOpen && (_jsxs("div", { className: "absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-950", children: [_jsxs("div", { className: "mb-2 flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute top-2.5 left-2 h-4 w-4 text-neutral-500" }), _jsx(Input, { placeholder: "Search model...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-9 pl-8", autoFocus: true })] }), _jsx("div", { className: "w-1/3", children: _jsxs(Select, { value: providerFilter, onChange: (e) => setProviderFilter(e.target.value), className: "h-9 text-xs", children: [_jsx("option", { value: "all", children: "All Providers" }), providers.map((p) => (_jsx("option", { value: p, children: p }, p)))] }) })] }), _jsx("div", { className: "max-h-[300px] space-y-1 overflow-y-auto", children: isLoading ? (_jsx("div", { className: "p-4 text-center text-xs text-neutral-500", children: "Loading models..." })) : filteredModels.length === 0 ? (_jsx("div", { className: "p-4 text-center text-xs text-neutral-500", children: "No models found." })) : (filteredModels.map((model) => (_jsxs("div", { className: cn('flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800', value === model.id && 'bg-neutral-100 font-medium dark:bg-neutral-800'), onClick: () => {
                                onChange(model.id);
                                setIsOpen(false);
                                setSearch(''); // Reset search on select
                            }, children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: model.name }), _jsxs("span", { className: "text-[10px] text-neutral-500", children: [model.provider, "/", model.id.split('/').pop()] })] }), value === model.id && _jsx(Check, { className: "h-4 w-4 text-green-600" })] }, model.id)))) })] }))] }));
}
