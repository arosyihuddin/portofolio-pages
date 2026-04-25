"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
  Check,
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

  // Active config form
  const [chatProviderId, setChatProviderId] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [generateProviderId, setGenerateProviderId] = useState("");
  const [generateModel, setGenerateModel] = useState("");

  // Add provider form
  const [adding, setAdding] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    base_url: "",
    api_key: "",
    custom_headers: [] as HeaderRow[],
  });

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

    setSavingProvider(id);

    const headersObj: Record<string, string> = {};
    data.custom_headers.forEach((h) => {
      if (h.key.trim()) headersObj[h.key.trim()] = h.value;
    });

    const { error } = await supabase
      .from("llm_providers")
      .update({
        name: data.name,
        base_url: data.base_url,
        api_key: data.api_key,
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
                name: data.name,
                base_url: data.base_url,
                api_key: data.api_key,
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
      const baseUrl = edit?.base_url || provider.base_url;
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

  // Add provider
  const handleAddProvider = async () => {
    if (!newProvider.name.trim() || !newProvider.base_url.trim()) {
      toast.error("Name and Base URL are required");
      return;
    }

    setSavingProvider("new");

    const headersObj: Record<string, string> = {};
    newProvider.custom_headers.forEach((h) => {
      if (h.key.trim()) headersObj[h.key.trim()] = h.value;
    });

    const { data, error } = await supabase
      .from("llm_providers")
      .insert({
        name: newProvider.name.trim(),
        base_url: newProvider.base_url.trim(),
        api_key: newProvider.api_key.trim(),
        custom_headers: headersObj,
        models: [],
      })
      .select()
      .single();


    if (error) {
      toast.error("Failed to add provider");
    } else {
      toast.success("Provider added");
      setProviders((prev) => [
        ...prev,
        { ...data, models: [], custom_headers: data.custom_headers || headersObj },
      ]);
      setNewProvider({ name: "", base_url: "", api_key: "", custom_headers: [] });
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
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LLM Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure AI providers and select models for chat and content
          generation
        </p>
      </div>

      {/* Active Configuration */}
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
                <select
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={!chatProviderId}
                >
                  <option value="">Select model...</option>
                  {getProviderModels(chatProviderId).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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
                <select
                  value={generateModel}
                  onChange={(e) => setGenerateModel(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={!generateProviderId}
                >
                  <option value="">Select model...</option>
                  {getProviderModels(generateProviderId).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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

      {/* Providers */}
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

        {/* Add provider form */}
        {adding && (
          <Card className="border shadow-sm border-primary/30">
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">New Provider</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) =>
                      setNewProvider((p) => ({ ...p, name: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setNewProvider((p) => ({ ...p, base_url: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setNewProvider((p) => ({ ...p, api_key: e.target.value }))
                    }
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
                    onClick={() =>
                      setNewProvider((p) => ({
                        ...p,
                        custom_headers: [
                          ...p.custom_headers,
                          { key: "", value: "" },
                        ],
                      }))
                    }
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

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdding(false);
                    setNewProvider({ name: "", base_url: "", api_key: "", custom_headers: [] });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddProvider}
                  disabled={savingProvider === "new"}
                >
                  {savingProvider === "new" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Add
                </Button>
              </div>
            </div>
          </Card>
        )}

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
                        <label className="text-xs font-medium text-muted-foreground">
                          Cached Models ({provider.models.length})
                        </label>
                        <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/30 p-2 space-y-0.5">
                          {provider.models.map((m) => (
                            <p
                              key={m}
                              className="text-xs text-muted-foreground font-mono truncate"
                            >
                              {m}
                            </p>
                          ))}
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
