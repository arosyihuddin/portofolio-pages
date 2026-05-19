"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  Server,
  Key,
  Settings2,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  base_url: string;
  api_key: string;
  custom_headers: Record<string, string>;
  models: string[];
  models_fetched_at: string | null;
  created_at: string;
}

interface ActiveConfig {
  id: string;
  chat_provider_id: string;
  chat_model: string;
  generate_provider_id: string;
  generate_model: string;
}

interface HeaderRow {
  key: string;
  value: string;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");

  try {
    const url = new URL(trimmed);
    const isLocal =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1";

    if (url.protocol === "http:" && !isLocal) {
      url.protocol = "https:";
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return trimmed;
  }
}

function headersToObject(headers: HeaderRow[]): Record<string, string> {
  const headersObj: Record<string, string> = {};

  headers.forEach((h) => {
    const key = h.key.trim();
    const value = h.value.trim();
    if (key && value) headersObj[key] = value;
  });

  return headersObj;
}

export default function AdminSettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeConfig, setActiveConfig] = useState<ActiveConfig | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [fetchingModels, setFetchingModels] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState<"config" | "providers">("config");

  // Active config form
  const [chatProviderId, setChatProviderId] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [chatModelOpen, setChatModelOpen] = useState(false);
  const [chatModelActiveIndex, setChatModelActiveIndex] = useState(0);
  const [generateProviderId, setGenerateProviderId] = useState("");
  const [generateModel, setGenerateModel] = useState("");
  const [generateModelOpen, setGenerateModelOpen] = useState(false);
  const [generateModelActiveIndex, setGenerateModelActiveIndex] = useState(0);

  // Add provider form
  const [adding, setAdding] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    base_url: "",
    api_key: "",
    custom_headers: [] as HeaderRow[],
  });
  const [testingNewProvider, setTestingNewProvider] = useState(false);
  const [newProviderModels, setNewProviderModels] = useState<string[]>([]);
  const [newProviderValidated, setNewProviderValidated] = useState(false);
  const [newProviderFingerprint, setNewProviderFingerprint] = useState("");

  // Edit provider state
  const [editData, setEditData] = useState<
    Record<
      string,
      {
        name: string;
        base_url: string;
        api_key: string;
        custom_headers: HeaderRow[];
        showApiKey: boolean;
      }
    >
  >({});

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      const [providersRes, configRes] = await Promise.all([
        supabase
          .from("llm_providers")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase.from("llm_active_config").select("*").limit(1).single(),
      ]);

      if (providersRes.data) {
        setProviders(
          providersRes.data.map((p: any) => ({
            ...p,
            models: Array.isArray(p.models) ? p.models : [],
            custom_headers: p.custom_headers || {},
          })),
        );
      }

      if (configRes.data) {
        setActiveConfig(configRes.data);
        setChatProviderId(configRes.data.chat_provider_id || "");
        setChatModel(configRes.data.chat_model || "");
        setGenerateProviderId(configRes.data.generate_provider_id || "");
        setGenerateModel(configRes.data.generate_model || "");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Get models for a specific provider
  const getProviderModels = (providerId: string): string[] => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.models || [];
  };

  const getFilteredModels = (providerId: string, query: string): string[] => {
    const normalizedQuery = query.trim().toLowerCase();
    const models = getProviderModels(providerId);

    if (!normalizedQuery) return models;

    return models.filter((model) =>
      model.toLowerCase().includes(normalizedQuery),
    );
  };

  const chatFilteredModels = getFilteredModels(chatProviderId, chatModel);
  const generateFilteredModels = getFilteredModels(
    generateProviderId,
    generateModel,
  );

  useEffect(() => {
    if (!chatModelOpen) return;

    document
      .getElementById(`chat-model-option-${chatModelActiveIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [chatModelActiveIndex, chatModelOpen, chatFilteredModels.length]);

  useEffect(() => {
    if (!generateModelOpen) return;

    document
      .getElementById(`generate-model-option-${generateModelActiveIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [
    generateModelActiveIndex,
    generateModelOpen,
    generateFilteredModels.length,
  ]);

  const getNewProviderFingerprint = () => {
    const baseUrl = normalizeBaseUrl(newProvider.base_url);
    const apiKey = newProvider.api_key.trim();
    const headers = headersToObject(newProvider.custom_headers);

    return JSON.stringify({ baseUrl, apiKey, headers });
  };

  const isNewProviderValidated =
    newProviderValidated &&
    newProviderModels.length > 0 &&
    newProviderFingerprint === getNewProviderFingerprint();

  const resetNewProviderValidation = () => {
    setNewProviderValidated(false);
    setNewProviderModels([]);
    setNewProviderFingerprint("");
  };

  const resetNewProviderForm = () => {
    setNewProvider({
      name: "",
      base_url: "",
      api_key: "",
      custom_headers: [],
    });
    resetNewProviderValidation();
  };

  const copyModels = async (models: string[]) => {
    if (!models.length) return;
    const text = models.join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success(`Copied ${models.length} models`);
    } catch {
      toast.error("Failed to copy models");
    }
  };

  const copyModel = async (model: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(model);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = model;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success("Model copied");
    } catch {
      toast.error("Failed to copy model");
    }
  };

  // Save active config
  const handleSaveConfig = async () => {
    if (!chatProviderId || !chatModel) {
      toast.error("Please select a provider and model for Chat");
      return;
    }
    if (!generateProviderId || !generateModel) {
      toast.error("Please select a provider and model for Generate");
      return;
    }

    setSavingConfig(true);

    const payload = {
      chat_provider_id: chatProviderId,
      chat_model: chatModel,
      generate_provider_id: generateProviderId,
      generate_model: generateModel,
    };

    let error;
    if (activeConfig?.id) {
      ({ error } = await supabase
        .from("llm_active_config")
        .update(payload)
        .eq("id", activeConfig.id));
    } else {
      const res = await supabase
        .from("llm_active_config")
        .insert(payload)
        .select()
        .single();
      error = res.error;
      if (res.data) setActiveConfig(res.data);
    }

    if (error) {
      toast.error("Failed to save configuration");
    } else {
      toast.success("Configuration saved");
    }
    setSavingConfig(false);
  };

  // Expand provider card
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const p = providers.find((p) => p.id === id);
      if (p && !editData[id]) {
        setEditData((prev) => ({
          ...prev,
          [id]: {
            name: p.name,
            base_url: p.base_url,
            api_key: p.api_key,
            custom_headers: Object.entries(p.custom_headers || {}).map(
              ([key, value]) => ({ key, value: value as string }),
            ),
            showApiKey: false,
          },
        }));
      }
    }
  };

  // Save provider
  const handleSaveProvider = async (id: string) => {
    const data = editData[id];
    if (!data) return;

    const name = data.name.trim();
    const baseUrl = normalizeBaseUrl(data.base_url);
    const apiKey = data.api_key.trim();

    if (!name || !baseUrl || !apiKey) {
      toast.error("Name, Base URL, and API Key are required");
      return;
    }

    setSavingProvider(id);

    const headersObj = headersToObject(data.custom_headers);

    const { error } = await supabase
      .from("llm_providers")
      .update({
        name,
        base_url: baseUrl,
        api_key: apiKey,
        custom_headers: headersObj,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to save provider");
    } else {
      toast.success("Provider saved");
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name,
                base_url: baseUrl,
                api_key: apiKey,
                custom_headers: headersObj,
              }
            : p,
        ),
      );
    }
    setSavingProvider(null);
  };

  // Fetch models for a provider
  const handleFetchModels = async (provider: Provider) => {
    setFetchingModels(provider.id);

    try {
      const edit = editData[provider.id];
      const baseUrl = normalizeBaseUrl(edit?.base_url || provider.base_url);
      const apiKey = edit?.api_key || provider.api_key;
      const headers = edit
        ? Object.fromEntries(
            edit.custom_headers
              .filter((h) => h.key.trim())
              .map((h) => [h.key.trim(), h.value]),
          )
        : provider.custom_headers;

      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey, customHeaders: headers }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch models");
        return;
      }

      const models = data.models || [];

      // Update in DB
      await supabase
        .from("llm_providers")
        .update({ models, models_fetched_at: new Date().toISOString() })
        .eq("id", provider.id);

      // Update local state
      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id
            ? { ...p, models, models_fetched_at: new Date().toISOString() }
            : p,
        ),
      );

      toast.success(`Fetched ${models.length} models`);
    } catch {
      toast.error("Failed to fetch models");
    } finally {
      setFetchingModels(null);
    }
  };

  const handleTestNewProvider = async () => {
    const name = newProvider.name.trim();
    const baseUrl = normalizeBaseUrl(newProvider.base_url);
    const apiKey = newProvider.api_key.trim();

    if (!name || !baseUrl || !apiKey) {
      toast.error("Name, Base URL, and API Key are required");
      return;
    }

    setTestingNewProvider(true);
    resetNewProviderValidation();

    try {
      const headers = headersToObject(newProvider.custom_headers);
      const fingerprint = JSON.stringify({ baseUrl, apiKey, headers });

      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey, customHeaders: headers }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Provider validation failed");
        return;
      }

      const models = data.models || [];

      if (!models.length) {
        toast.error("Provider is valid, but no models were returned");
        return;
      }

      setNewProviderModels(models);
      setNewProviderValidated(true);
      setNewProviderFingerprint(fingerprint);
      toast.success(`Provider valid. Found ${models.length} models`);
    } catch {
      toast.error("Provider validation failed");
    } finally {
      setTestingNewProvider(false);
    }
  };

  // Add provider
  const handleAddProvider = async () => {
    const name = newProvider.name.trim();
    const baseUrl = normalizeBaseUrl(newProvider.base_url);
    const apiKey = newProvider.api_key.trim();

    if (!name || !baseUrl || !apiKey) {
      toast.error("Name, Base URL, and API Key are required");
      return;
    }

    if (!isNewProviderValidated) {
      toast.error("Fetch models first to validate this provider");
      return;
    }

    setSavingProvider("new");

    const headersObj = headersToObject(newProvider.custom_headers);

    const { data, error } = await supabase
      .from("llm_providers")
      .insert({
        name,
        base_url: baseUrl,
        api_key: apiKey,
        custom_headers: headersObj,
        models: newProviderModels,
        models_fetched_at: new Date().toISOString(),
      })
      .select()
      .single();


    if (error) {
      toast.error("Failed to add provider");
    } else {
      toast.success("Provider added");
      setProviders((prev) => [
        ...prev,
        {
          ...data,
          models: Array.isArray(data.models) ? data.models : newProviderModels,
          custom_headers: data.custom_headers || headersObj,
        },
      ]);
      resetNewProviderForm();
      setAdding(false);
    }
    setSavingProvider(null);
  };

  // Delete provider
  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from("llm_providers")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      if (error.code === "23503") {
        toast.error(
          "Cannot delete: this provider is currently active. Switch to another provider first.",
        );
      } else {
        toast.error("Failed to delete provider");
      }
    } else {
      toast.success("Provider deleted");
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (expandedId === deleteTarget.id) setExpandedId(null);
    }
    setDeleteTarget(null);
  };

  // Helper: time ago
  const timeAgo = (date: string | null) => {
    if (!date) return "never";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LLM Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure AI providers and select models for chat and content
          generation
        </p>
      </div>

      <div className="inline-flex rounded-md border bg-muted/30 p-1">
        <Button
          variant={activeTab === "config" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("config")}
          className="gap-1.5"
        >
          <Settings2 className="h-3.5 w-3.5" />
          AI Config
        </Button>
        <Button
          variant={activeTab === "providers" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("providers")}
          className="gap-1.5"
        >
          <Server className="h-3.5 w-3.5" />
          Providers
        </Button>
      </div>

      {/* Active Configuration */}
      {activeTab === "config" && (
      <Card className="border shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Active Configuration</h2>
            </div>
            <Button
              size="sm"
              onClick={handleSaveConfig}
              disabled={savingConfig}
            >
              {savingConfig ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-5">
          {/* Chat Assistant */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Chat Assistant
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Provider</span>
                <select
                  value={chatProviderId}
                  onChange={(e) => {
                    setChatProviderId(e.target.value);
                    setChatModel("");
                    setChatModelActiveIndex(0);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Model</span>
                <div className="relative">
                  <input
                    value={chatModel}
                    onChange={(e) => {
                      setChatModel(e.target.value);
                      setChatModelOpen(true);
                      setChatModelActiveIndex(0);
                    }}
                    onFocus={() => setChatModelOpen(true)}
                    onKeyDown={(e) => {
                      if (!chatModelOpen && e.key === "ArrowDown") {
                        setChatModelOpen(true);
                        return;
                      }

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setChatModelActiveIndex((index) =>
                          Math.min(index + 1, chatFilteredModels.length - 1),
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setChatModelActiveIndex((index) =>
                          Math.max(index - 1, 0),
                        );
                      }

                      if (e.key === "Enter" && chatModelOpen) {
                        const model = chatFilteredModels[chatModelActiveIndex];
                        if (model) {
                          e.preventDefault();
                          setChatModel(model);
                          setChatModelOpen(false);
                        }
                      }

                      if (e.key === "Escape") {
                        setChatModelOpen(false);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setChatModelOpen(false), 120);
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!chatProviderId}
                    placeholder="Search model..."
                  />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {chatModelOpen && chatProviderId && (
                    <div className="hide-scrollbar absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                      {chatFilteredModels.length > 0 ? (
                        chatFilteredModels.map(
                          (model, index) => (
                            <button
                              key={model}
                              id={`chat-model-option-${index}`}
                              type="button"
                              title={model}
                              className={`block w-full truncate rounded px-2 py-1.5 text-left font-mono text-xs hover:bg-accent hover:text-accent-foreground ${
                                index === chatModelActiveIndex
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setChatModel(model);
                                setChatModelOpen(false);
                              }}
                              onMouseEnter={() => setChatModelActiveIndex(index)}
                            >
                              {model}
                            </button>
                          ),
                        )
                      ) : (
                        <div className="px-2 py-2 text-xs text-muted-foreground">
                          No matching models
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {chatProviderId &&
                  getProviderModels(chatProviderId).length === 0 && (
                    <p className="text-[10px] text-yellow-500">
                      No models cached. Fetch models for this provider first.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Content Generator */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Content Generator
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Provider</span>
                <select
                  value={generateProviderId}
                  onChange={(e) => {
                    setGenerateProviderId(e.target.value);
                    setGenerateModel("");
                    setGenerateModelActiveIndex(0);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Model</span>
                <div className="relative">
                  <input
                    value={generateModel}
                    onChange={(e) => {
                      setGenerateModel(e.target.value);
                      setGenerateModelOpen(true);
                      setGenerateModelActiveIndex(0);
                    }}
                    onFocus={() => setGenerateModelOpen(true)}
                    onKeyDown={(e) => {
                      if (!generateModelOpen && e.key === "ArrowDown") {
                        setGenerateModelOpen(true);
                        return;
                      }

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setGenerateModelActiveIndex((index) =>
                          Math.min(index + 1, generateFilteredModels.length - 1),
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setGenerateModelActiveIndex((index) =>
                          Math.max(index - 1, 0),
                        );
                      }

                      if (e.key === "Enter" && generateModelOpen) {
                        const model =
                          generateFilteredModels[generateModelActiveIndex];
                        if (model) {
                          e.preventDefault();
                          setGenerateModel(model);
                          setGenerateModelOpen(false);
                        }
                      }

                      if (e.key === "Escape") {
                        setGenerateModelOpen(false);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(
                        () => setGenerateModelOpen(false),
                        120,
                      );
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!generateProviderId}
                    placeholder="Search model..."
                  />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {generateModelOpen && generateProviderId && (
                    <div className="hide-scrollbar absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                      {generateFilteredModels.length > 0 ? (
                        generateFilteredModels.map((model, index) => (
                          <button
                            key={model}
                            id={`generate-model-option-${index}`}
                            type="button"
                            title={model}
                            className={`block w-full truncate rounded px-2 py-1.5 text-left font-mono text-xs hover:bg-accent hover:text-accent-foreground ${
                              index === generateModelActiveIndex
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setGenerateModel(model);
                              setGenerateModelOpen(false);
                            }}
                            onMouseEnter={() =>
                              setGenerateModelActiveIndex(index)
                            }
                          >
                            {model}
                          </button>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-xs text-muted-foreground">
                          No matching models
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {generateProviderId &&
                  getProviderModels(generateProviderId).length === 0 && (
                    <p className="text-[10px] text-yellow-500">
                      No models cached. Fetch models for this provider first.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Providers */}
      {activeTab === "providers" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Providers</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Provider
          </Button>
        </div>

        <AlertDialog
          open={adding}
          onOpenChange={(open) => {
            setAdding(open);
            if (!open) resetNewProviderForm();
          }}
        >
          <AlertDialogContent className="hide-scrollbar max-h-[90vh] max-w-4xl overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Add Provider</AlertDialogTitle>
              <AlertDialogDescription>
                Fetch models first to validate the Base URL and API key before
                saving this provider.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => {
                      resetNewProviderValidation();
                      setNewProvider((p) => ({ ...p, name: e.target.value }));
                    }}
                    placeholder="e.g. Groq"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={newProvider.base_url}
                    onChange={(e) => {
                      resetNewProviderValidation();
                      setNewProvider((p) => ({
                        ...p,
                        base_url: e.target.value,
                      }));
                    }}
                    placeholder="https://api.groq.com/openai/v1"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={newProvider.api_key}
                    onChange={(e) => {
                      resetNewProviderValidation();
                      setNewProvider((p) => ({
                        ...p,
                        api_key: e.target.value,
                      }));
                    }}
                    placeholder="API key"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Custom Headers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Custom Headers (optional)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      resetNewProviderValidation();
                      setNewProvider((p) => ({
                        ...p,
                        custom_headers: [
                          ...p.custom_headers,
                          { key: "", value: "" },
                        ],
                      }));
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {newProvider.custom_headers.length > 0 && (
                  <div className="space-y-1.5">
                    {newProvider.custom_headers.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={h.key}
                          onChange={(e) => {
                            resetNewProviderValidation();
                            const updated = [...newProvider.custom_headers];
                            updated[i] = { ...updated[i], key: e.target.value };
                            setNewProvider((p) => ({
                              ...p,
                              custom_headers: updated,
                            }));
                          }}
                          placeholder="Header name"
                          className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <input
                          type="text"
                          value={h.value}
                          onChange={(e) => {
                            resetNewProviderValidation();
                            const updated = [...newProvider.custom_headers];
                            updated[i] = { ...updated[i], value: e.target.value };
                            setNewProvider((p) => ({
                              ...p,
                              custom_headers: updated,
                            }));
                          }}
                          placeholder="Value"
                          className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive"
                          onClick={() => {
                            resetNewProviderValidation();
                            const updated = newProvider.custom_headers.filter(
                              (_, idx) => idx !== i,
                            );
                            setNewProvider((p) => ({
                              ...p,
                              custom_headers: updated,
                            }));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isNewProviderValidated ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium">
                        {isNewProviderValidated
                          ? "Provider validated"
                          : "Validate provider first"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isNewProviderValidated
                        ? `${newProviderModels.length} models ready to save.`
                        : "Fetch models to verify the Base URL and API key before adding."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestNewProvider}
                    disabled={testingNewProvider}
                  >
                    {testingNewProvider ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                    )}
                    Fetch Models
                  </Button>
                </div>

                {newProviderModels.length > 0 && (
                  <div className="mt-3 rounded-md border bg-background/60 p-2">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Models
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => copyModels(newProviderModels)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <div className="hide-scrollbar grid max-h-[40vh] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                      {newProviderModels.map((model) => (
                        <div
                          key={model}
                          title={model}
                          className="group flex min-w-0 items-center gap-2 rounded border bg-muted/40 px-2 py-1.5 font-mono text-xs text-muted-foreground"
                        >
                          <span className="block min-w-0 flex-1 truncate">
                            {model}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-muted-foreground opacity-60 transition hover:text-foreground group-hover:opacity-100"
                            onClick={() => copyModel(model)}
                            aria-label={`Copy ${model}`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AlertDialogFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdding(false);
                    resetNewProviderForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddProvider}
                  disabled={savingProvider === "new" || !isNewProviderValidated}
                >
                  {savingProvider === "new" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Add
                </Button>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Provider list */}
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No providers configured yet.
          </p>
        ) : (
          providers.map((provider) => {
            const isExpanded = expandedId === provider.id;
            const edit = editData[provider.id];
            const isActiveChat = chatProviderId === provider.id;
            const isActiveGenerate = generateProviderId === provider.id;

            return (
              <Card
                key={provider.id}
                className="border shadow-sm"
              >
                {/* Provider header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => toggleExpand(provider.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">
                        {provider.name}
                      </h3>
                      {isActiveChat && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <MessageCircle className="h-2.5 w-2.5" />
                          Chat
                        </span>
                      )}
                      {isActiveGenerate && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <Sparkles className="h-2.5 w-2.5" />
                          Generate
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {provider.base_url}
                      {" · "}
                      {provider.models.length} models
                      {provider.models_fetched_at &&
                        ` (${timeAgo(provider.models_fetched_at)})`}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleFetchModels(provider)}
                      disabled={fetchingModels === provider.id}
                    >
                      {fetchingModels === provider.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Fetch Models
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(provider)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded edit form */}
                {isExpanded && edit && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Name
                        </label>
                        <input
                          type="text"
                          value={edit.name}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                name: e.target.value,
                              },
                            }))
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Base URL
                        </label>
                        <input
                          type="text"
                          value={edit.base_url}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                base_url: e.target.value,
                              },
                            }))
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={edit.showApiKey ? "text" : "password"}
                          value={edit.api_key}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                api_key: e.target.value,
                              },
                            }))
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                showApiKey: !prev[provider.id].showApiKey,
                              },
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {edit.showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Custom Headers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                          Custom Headers
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                custom_headers: [
                                  ...prev[provider.id].custom_headers,
                                  { key: "", value: "" },
                                ],
                              },
                            }))
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {edit.custom_headers.length > 0 && (
                        <div className="space-y-1.5">
                          {edit.custom_headers.map((h, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={h.key}
                                onChange={(e) => {
                                  const updated = [...edit.custom_headers];
                                  updated[i] = { ...updated[i], key: e.target.value };
                                  setEditData((prev) => ({
                                    ...prev,
                                    [provider.id]: {
                                      ...prev[provider.id],
                                      custom_headers: updated,
                                    },
                                  }));
                                }}
                                placeholder="Header name"
                                className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                              <input
                                type="text"
                                value={h.value}
                                onChange={(e) => {
                                  const updated = [...edit.custom_headers];
                                  updated[i] = { ...updated[i], value: e.target.value };
                                  setEditData((prev) => ({
                                    ...prev,
                                    [provider.id]: {
                                      ...prev[provider.id],
                                      custom_headers: updated,
                                    },
                                  }));
                                }}
                                placeholder="Value"
                                className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-destructive"
                                onClick={() => {
                                  const updated = edit.custom_headers.filter(
                                    (_, idx) => idx !== i,
                                  );
                                  setEditData((prev) => ({
                                    ...prev,
                                    [provider.id]: {
                                      ...prev[provider.id],
                                      custom_headers: updated,
                                    },
                                  }));
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cached models preview */}
                    {provider.models.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">
                            Cached Models
                          </label>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {provider.models.length}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => copyModels(provider.models)}
                            >
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-md border bg-muted/20 p-2">
                          <div className="hide-scrollbar grid max-h-[32vh] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {provider.models.map((model) => (
                            <div
                              key={model}
                              title={model}
                              className="group flex min-w-0 items-center gap-2 rounded border bg-background/60 px-2 py-1.5 font-mono text-xs text-muted-foreground"
                            >
                              <span className="block min-w-0 flex-1 truncate">
                                {model}
                              </span>
                              <button
                                type="button"
                                className="shrink-0 text-muted-foreground opacity-60 transition hover:text-foreground group-hover:opacity-100"
                                onClick={() => copyModel(model)}
                                aria-label={`Copy ${model}`}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSaveProvider(provider.id)}
                        disabled={savingProvider === provider.id}
                      >
                        {savingProvider === provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Provider
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              ? This action cannot be undone.
              {(chatProviderId === deleteTarget?.id ||
                generateProviderId === deleteTarget?.id) && (
                <span className="block mt-2 text-yellow-500">
                  Warning: This provider is currently active. You will need to
                  switch to another provider first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
