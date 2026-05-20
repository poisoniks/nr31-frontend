import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2, ChevronDown, ChevronRight, Save, RefreshCw, AlertCircle, CheckCircle, Search, X, Edit2 } from 'lucide-react';
import { configApi } from '../../api/configApi';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { components } from '../../api/types';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import LocaleTabBar from '../../components/ui/LocaleTabBar';

type AppConfigDto = components['schemas']['AppConfigDto'];

/* ─────────────────────── JSON schema types ─────────────────────── */
interface JsonSchemaProperty {
    type?: string | string[];
    description?: string;
    title?: string;
    enum?: unknown[];
    items?: JsonSchemaProperty;
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    default?: unknown;
    patternProperties?: Record<string, JsonSchemaProperty>;
    additionalProperties?: boolean | JsonSchemaProperty;
}

interface JsonSchema extends JsonSchemaProperty {
    $schema?: string;
    $id?: string;
}

/* ─────────────────────── helpers ─────────────────────── */
const localized = (map: Record<string, string> | undefined, lang: string): string => {
    if (!map) return '';
    return map[lang] || Object.values(map)[0] || '';
};

const parseJson = <T,>(str: string | undefined): T | null => {
    if (!str) return null;
    try {
        return JSON.parse(str) as T;
    } catch {
        return null;
    }
};

const resolveType = (schema: JsonSchemaProperty): string => {
    if (!schema.type) return 'string';
    if (Array.isArray(schema.type)) {
        const nonNull = schema.type.find(t => t !== 'null');
        return nonNull ?? 'string';
    }
    return schema.type;
};

/* ─────────────────────── Skeleton ─────────────────────── */
const SkeletonCard: React.FC = () => (
    <div className="rounded-xl border border-nr-border/50 bg-white/5 dark:bg-black/20 backdrop-blur-md p-5 space-y-3 animate-pulse">
        <div className="h-4 bg-nr-text/10 rounded w-1/3" />
        <div className="h-3 bg-nr-text/10 rounded w-2/3" />
        <div className="h-8 bg-nr-text/10 rounded" />
    </div>
);

/* ─────────────────────── Field renderers ─────────────────────── */
interface FieldProps {
    schema: JsonSchemaProperty;
    value: unknown;
    onChange: (v: unknown) => void;
    depth?: number;
    lang: string;
    readOnly?: boolean;
}

const inputClass =
    'w-full bg-nr-bg border border-nr-border rounded-lg px-3 py-2 text-sm text-nr-text ' +
    'focus:outline-none focus:border-nr-accent/60 transition-colors';

const getPropertySchema = (schema: JsonSchemaProperty, key: string): JsonSchemaProperty => {
    if (schema.properties && schema.properties[key]) {
        return schema.properties[key];
    }
    if (schema.patternProperties) {
        for (const pattern of Object.keys(schema.patternProperties)) {
            try {
                const regex = new RegExp(pattern);
                if (regex.test(key)) {
                    return schema.patternProperties[pattern];
                }
            } catch {
                // Ignore invalid regex
            }
        }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        return schema.additionalProperties as JsonSchemaProperty;
    }
    return {};
};

interface DynamicObjectFieldProps {
    schema: JsonSchemaProperty;
    value: unknown;
    onChange: (v: unknown) => void;
    depth: number;
    lang: string;
    readOnly?: boolean;
}

const DynamicObjectField: React.FC<DynamicObjectFieldProps> = ({
    schema,
    value,
    onChange,
    depth,
    lang,
    readOnly,
}) => {
    const { t } = useTranslation();
    const obj = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
    const keys = Object.keys(obj);

    const [newKey, setNewKey] = useState('');
    const [keyError, setKeyError] = useState('');

    const handleAddKey = () => {
        const trimmed = newKey.trim();
        if (!trimmed) return;
        if (trimmed in obj) {
            setKeyError(t('admin.config.key_exists') || 'Key already exists');
            return;
        }

        // Validate against pattern if patternProperties exists
        let patternMatched = false;
        let matchedSchema: JsonSchemaProperty = {};

        if (schema.patternProperties) {
            for (const pattern of Object.keys(schema.patternProperties)) {
                try {
                    const regex = new RegExp(pattern);
                    if (regex.test(trimmed)) {
                        patternMatched = true;
                        matchedSchema = schema.patternProperties[pattern];
                        break;
                    }
                } catch {}
            }
        } else if (schema.additionalProperties) {
            patternMatched = true;
            if (typeof schema.additionalProperties === 'object') {
                matchedSchema = schema.additionalProperties as JsonSchemaProperty;
            }
        } else {
            patternMatched = true;
        }

        if (!patternMatched) {
            setKeyError(t('admin.config.invalid_key_pattern') || 'Key does not match pattern requirements');
            return;
        }

        // Determine default value based on matchedSchema
        const valType = resolveType(matchedSchema);
        const defaultValue =
            valType === 'array' ? [] :
            valType === 'boolean' ? false :
            valType === 'number' || valType === 'integer' ? 0 :
            valType === 'object' ? {} :
            '';

        onChange({
            ...obj,
            [trimmed]: defaultValue,
        });
        setNewKey('');
        setKeyError('');
    };

    const handleRemoveKey = (k: string) => {
        const copy = { ...obj };
        delete copy[k];
        onChange(copy);
    };

    return (
        <div className="space-y-4 pl-3 border-l-2 border-nr-border/40">
            {keys.length === 0 ? (
                <p className="text-xs text-nr-text/40 italic">
                    {t('admin.config.no_properties') || 'No items defined'}
                </p>
            ) : (
                <div className="space-y-4">
                    {keys.map(k => {
                        const propSchema = getPropertySchema(schema, k);
                        return (
                            <div key={k} className="p-3 rounded-lg border border-nr-border/30 bg-nr-bg/10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-nr-accent">{k}</span>
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveKey(k)}
                                            className="p-1 rounded text-nr-text/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-xs"
                                            title="Remove property"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <SchemaField
                                    schema={propSchema}
                                    value={obj[k]}
                                    onChange={v => onChange({ ...obj, [k]: v })}
                                    depth={depth + 1}
                                    lang={lang}
                                    readOnly={readOnly}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {!readOnly && (
                <div className="space-y-1 pt-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className={`${inputClass} max-w-[200px]`}
                            placeholder={t('admin.config.new_key_placeholder') || 'Property name...'}
                            value={newKey}
                            onChange={e => {
                                setNewKey(e.target.value);
                                setKeyError('');
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddKey}
                            className="text-xs px-3 py-2 rounded border border-nr-accent/30 text-nr-accent hover:bg-nr-accent/10 transition-colors cursor-pointer"
                        >
                            {t('admin.config.add_key')}
                        </button>
                    </div>
                    {keyError && <p className="text-xs text-red-400 mt-1">{keyError}</p>}
                </div>
            )}
        </div>
    );
};

const SchemaField: React.FC<FieldProps> = ({ schema, value, onChange, depth = 0, lang, readOnly }) => {
    const { t } = useTranslation();
    const type = resolveType(schema);

    /* ── enum ── */
    if (schema.enum) {
        return (
            <select
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                value={String(value ?? schema.default ?? schema.enum[0])}
                onChange={e => onChange(e.target.value)}
                disabled={readOnly}
            >
                {schema.enum.map((opt, i) => (
                    <option key={i} value={String(opt)}>
                        {String(opt)}
                    </option>
                ))}
            </select>
        );
    }

    /* ── boolean ── */
    if (type === 'boolean') {
        return (
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={Boolean(value)}
                        onChange={e => onChange(e.target.checked)}
                        disabled={readOnly}
                    />
                    <div
                        className={`w-9 h-5 rounded-full transition-colors ${readOnly ? 'opacity-50 cursor-not-allowed' : ''} ${Boolean(value) ? 'bg-nr-accent' : 'bg-nr-border'}`}
                    />
                    <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${Boolean(value) ? 'translate-x-4' : ''}`}
                    />
                </div>
                <span className="text-sm text-nr-text/70">{Boolean(value) ? 'true' : 'false'}</span>
            </label>
        );
    }

    /* ── number / integer ── */
    if (type === 'number' || type === 'integer') {
        return (
            <input
                type="number"
                className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                value={String(value ?? schema.default ?? '')}
                min={schema.minimum}
                max={schema.maximum}
                step={type === 'integer' ? 1 : undefined}
                onChange={e => onChange(type === 'integer' ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
                disabled={readOnly}
            />
        );
    }

    /* ── array ── */
    if (type === 'array') {
        const arr = Array.isArray(value) ? value : [];
        const itemSchema: JsonSchemaProperty = schema.items ?? { type: 'string' };

        const addItem = () => {
            const defaultVal = resolveType(itemSchema) === 'boolean' ? false
                : resolveType(itemSchema) === 'number' || resolveType(itemSchema) === 'integer' ? 0
                : resolveType(itemSchema) === 'object' ? {}
                : '';
            onChange([...arr, defaultVal]);
        };

        const removeItem = (idx: number) => {
            onChange(arr.filter((_, i) => i !== idx));
        };

        const updateItem = (idx: number, v: unknown) => {
            const next = [...arr];
            next[idx] = v;
            onChange(next);
        };

        return (
            <div className="space-y-2 pl-3 border-l-2 border-nr-accent/20">
                {arr.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <div className="flex-1">
                            <SchemaField
                                schema={itemSchema}
                                value={item}
                                onChange={v => updateItem(idx, v)}
                                depth={depth + 1}
                                lang={lang}
                                readOnly={readOnly}
                            />
                        </div>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="mt-1 p-1 rounded text-nr-text/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex-shrink-0"
                                title="Remove item"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                {!readOnly && (
                    <button
                        type="button"
                        onClick={addItem}
                        className="text-xs px-2 py-1 rounded border border-nr-accent/30 text-nr-accent hover:bg-nr-accent/10 transition-colors cursor-pointer"
                    >
                        {t('admin.config.add_item')}
                    </button>
                )}
            </div>
        );
    }

    /* ── object ── */
    if (type === 'object') {
        if (schema.properties) {
            const obj = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
            return (
                <div className="space-y-3 pl-3 border-l-2 border-nr-border/40">
                    {Object.entries(schema.properties).map(([key, propSchema]) => {
                        const label = (lang && propSchema.title) || key;
                        const desc = propSchema.description || '';
                        return (
                            <div key={key} className="space-y-1">
                                <label className="text-xs font-bold text-nr-text/50 uppercase tracking-wider flex items-center gap-1">
                                    {label}
                                    {schema.required?.includes(key) && (
                                        <span className="text-nr-accent">*</span>
                                    )}
                                </label>
                                {desc && (
                                    <p className="text-xs text-nr-text/40 mb-1">{desc}</p>
                                )}
                                <SchemaField
                                    schema={propSchema}
                                    value={obj[key] ?? propSchema.default}
                                    onChange={v => onChange({ ...obj, [key]: v })}
                                    depth={depth + 1}
                                    lang={lang}
                                    readOnly={readOnly}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <DynamicObjectField
                schema={schema}
                value={value}
                onChange={onChange}
                depth={depth}
                lang={lang}
                readOnly={readOnly}
            />
        );
    }

    /* ── string (default) ── */
    const strVal = String(value ?? schema.default ?? '');
    if (schema.maxLength && schema.maxLength > 120) {
        return (
            <textarea
                className={`${inputClass} min-h-[80px] resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
                value={strVal}
                maxLength={schema.maxLength}
                minLength={schema.minLength}
                onChange={e => onChange(e.target.value)}
                rows={3}
                disabled={readOnly}
            />
        );
    }
    return (
        <input
            type="text"
            className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            value={strVal}
            maxLength={schema.maxLength}
            minLength={schema.minLength}
            onChange={e => onChange(e.target.value)}
            disabled={readOnly}
        />
    );
};

/* ─────────────────────── Config card ─────────────────────── */
interface ConfigCardProps {
    config: AppConfigDto;
    lang: string;
    onSaved: (updated: AppConfigDto) => void;
    readOnly?: boolean;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ config, lang, onSaved, readOnly }) => {
    const { t } = useTranslation();
    const { setError } = useUIStore();

    const schema = parseJson<JsonSchema>(config.configSchema);
    const initialValue = parseJson<unknown>(config.configValue);

    const [value, setValue] = useState<unknown>(initialValue);
    const [descriptionMap, setDescriptionMap] = useState<Record<string, string>>(config.description || {});
    const [activeLocale, setActiveLocale] = useState(lang);
    const [editingDescription, setEditingDescription] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setValue(parseJson<unknown>(config.configValue));
        setDescriptionMap(config.description || {});
        setActiveLocale(lang);
        setEditingDescription(false);
        setDirty(false);
    }, [config, lang]);

    const handleChange = (v: unknown) => {
        setValue(v);
        setDirty(true);
    };

    const handleDescriptionChange = (langKey: string, newText: string) => {
        setDescriptionMap(prev => ({
            ...prev,
            [langKey]: newText,
        }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const serialized = JSON.stringify(value);
            const updated = await configApi.updateConfig(config.name, {
                ...config,
                configValue: serialized,
                description: descriptionMap,
            });
            onSaved(updated);
            setDirty(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch {
            setError(t('admin.config.error_save'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setValue(initialValue);
        setDescriptionMap(config.description || {});
        setEditingDescription(false);
        setDirty(false);
    };

    const description = localized(descriptionMap, lang);
    const topType = schema ? resolveType(schema) : 'string';
    const isComplex = topType === 'object' || topType === 'array';

    return (
        <div className={`rounded-xl border transition-colors ${dirty ? 'border-nr-accent/40' : 'border-nr-border/50'} bg-white/5 dark:bg-black/20 backdrop-blur-md overflow-hidden`}>
            {/* Header row */}
            <div
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
                <div
                    id={`config-card-${config.name}`}
                    onClick={() => isComplex && setExpanded(p => !p)}
                    className={`flex-1 min-w-0 ${isComplex ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-nr-text/80">{config.name}</span>
                        {dirty && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nr-accent/20 text-nr-accent border border-nr-accent/30 font-medium">
                                {t('admin.config.unsaved')}
                            </span>
                        )}
                        {schema && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nr-text/10 text-nr-text/40 border border-nr-border/40 font-mono">
                                {topType}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-nr-text/50 mt-0.5 truncate">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    {/* Pen Button (Edit description) */}
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingDescription(p => !p);
                                if (isComplex && !expanded) {
                                    setExpanded(true);
                                }
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${editingDescription ? 'text-nr-accent bg-nr-accent/15 hover:bg-nr-accent/25' : 'text-nr-text/40 hover:text-nr-accent hover:bg-nr-accent/10'}`}
                            title="Edit description"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                    {isComplex && (
                        <button
                            type="button"
                            onClick={() => setExpanded(p => !p)}
                            className="text-nr-text/30 hover:text-nr-text/60 p-1.5 rounded-lg cursor-pointer"
                        >
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className={isComplex && !expanded ? 'hidden' : 'px-5 pb-5'}>
                {/* Editable descriptions with LocaleTabBar if write access is granted */}
                {!readOnly && editingDescription && (
                    <div className="mb-4 pb-4 border-b border-nr-border/30 space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-nr-text/50 uppercase tracking-wider">
                                {t('admin.config.description_label')}
                            </label>
                            <LocaleTabBar activeLocale={activeLocale} onLocaleChange={setActiveLocale} />
                        </div>
                        <input
                            type="text"
                            className={inputClass}
                            value={descriptionMap[activeLocale] ?? ''}
                            onChange={e => handleDescriptionChange(activeLocale, e.target.value)}
                            disabled={readOnly}
                            placeholder={`${activeLocale.toUpperCase()} description`}
                        />
                    </div>
                )}

                {schema ? (
                    <div className="space-y-2">
                        {description && isComplex && readOnly && (
                            <p className="text-xs text-nr-text/40 pb-1">{description}</p>
                        )}
                        <SchemaField
                            schema={schema}
                            value={value}
                            onChange={handleChange}
                            lang={lang}
                            readOnly={readOnly}
                        />
                    </div>
                ) : (
                    /* No schema: raw text editing */
                    <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-amber-400/80">
                            <AlertCircle size={12} />
                            <span>{t('admin.config.no_schema')}</span>
                        </div>
                        <textarea
                            className={`${inputClass} font-mono text-xs min-h-[80px] resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
                            value={String(value ?? '')}
                            onChange={e => handleChange(e.target.value)}
                            rows={4}
                            disabled={readOnly}
                        />
                    </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                    {!readOnly && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={!dirty || saving}
                            id={`config-save-${config.name}`}
                        >
                            {saving ? (
                                <><RefreshCw size={13} className="animate-spin" /> {t('admin.config.saving')}</>
                            ) : (
                                <><Save size={13} /> {t('admin.config.save')}</>
                            )}
                        </Button>
                    )}
                    {!readOnly && dirty && (
                        <Button variant="ghost" size="sm" onClick={handleReset} disabled={saving}>
                            {t('admin.config.reset')}
                        </Button>
                    )}
                    {saved && (
                        <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                            <CheckCircle size={13} />
                            {t('admin.config.save_success')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────── Main Page ─────────────────────── */
const SystemConfigPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || '').split('-')[0] || 'en';
    const { setError } = useUIStore();
    const user = useAuthStore(state => state.user);

    const canWrite = useMemo(() => user?.authorities?.includes('config:write') ?? false, [user]);

    const [configs, setConfigs] = useState<AppConfigDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const { page, size, totalPages, setTotalPages, handlePageChange, resetPage } = usePagination(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            resetPage();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, resetPage]);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const data = debouncedQuery.trim()
                ? await configApi.searchConfigs(debouncedQuery.trim(), { page, size })
                : await configApi.getAllConfigs({ page, size });
            setConfigs(data.content);
            setTotalPages(data.page?.totalPages || 1);
        } catch {
            setError(t('admin.config.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, debouncedQuery, setError, t, setTotalPages]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleSaved = (updated: AppConfigDto) => {
        setConfigs(prev => prev.map(c => (c.name === updated.name ? updated : c)));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                        <Settings2 className="text-nr-accent" size={24} />
                        {t('admin.config.title')}
                    </h1>
                    <p className="text-nr-text/60">{t('admin.config.subtitle')}</p>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nr-text/30" />
                    <input
                        type="text"
                        className={`${inputClass} pl-8 pr-8`}
                        placeholder={t('admin.config.search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-nr-text/30 hover:text-nr-text/60 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Config list */}
            <div className="space-y-3 min-h-[800px]">
                {loading ? (
                    Array.from({ length: size }).map((_, i) => <SkeletonCard key={i} />)
                ) : configs.length === 0 ? (
                    <div className="rounded-xl border border-nr-border/40 bg-white/5 dark:bg-black/20 backdrop-blur-md px-6 py-10 text-center text-nr-text/40 text-sm">
                        {t('admin.config.empty')}
                    </div>
                ) : (
                    configs.map(config => (
                        <ConfigCard
                            key={config.name}
                            config={config}
                            lang={lang}
                            onSaved={handleSaved}
                            readOnly={!canWrite}
                        />
                    ))
                )}
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default SystemConfigPage;
