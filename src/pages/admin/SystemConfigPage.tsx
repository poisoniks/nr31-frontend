import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2, ChevronDown, ChevronRight, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { configApi } from '../../api/configApi';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { components } from '../../api/types';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

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

const SchemaField: React.FC<FieldProps> = ({ schema, value, onChange, depth = 0, lang, readOnly }) => {
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
                        + Add item
                    </button>
                )}
            </div>
        );
    }

    /* ── object ── */
    if (type === 'object' && schema.properties) {
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
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (v: unknown) => {
        setValue(v);
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const serialized = JSON.stringify(value);
            const updated = await configApi.updateConfig(config.name, {
                ...config,
                configValue: serialized,
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
        setDirty(false);
    };

    const description = localized(config.description, lang);
    const topType = schema ? resolveType(schema) : 'string';
    const isComplex = topType === 'object' || topType === 'array';

    return (
        <div className={`rounded-xl border transition-colors ${dirty ? 'border-nr-accent/40' : 'border-nr-border/50'} bg-white/5 dark:bg-black/20 backdrop-blur-md overflow-hidden`}>
            {/* Header row */}
            <button
                type="button"
                id={`config-card-${config.name}`}
                onClick={() => isComplex && setExpanded(p => !p)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${isComplex ? 'hover:bg-nr-text/[0.02] cursor-pointer' : 'cursor-default'}`}
            >
                <div className="flex-1 min-w-0">
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
                {isComplex && (
                    <span className="text-nr-text/30 flex-shrink-0">
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                )}
            </button>

            {/* Body */}
            <div className={isComplex && !expanded ? 'hidden' : 'px-5 pb-5'}>
                {schema ? (
                    <div className="space-y-2">
                        {description && isComplex && (
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

    const { page, size, totalPages, setTotalPages, handlePageChange } = usePagination(10);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await configApi.getAllConfigs({ page, size });
            setConfigs(data.content);
            setTotalPages(data.page?.totalPages || 1);
        } catch {
            setError(t('admin.config.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, size, setError, t, setTotalPages]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleSaved = (updated: AppConfigDto) => {
        setConfigs(prev => prev.map(c => (c.name === updated.name ? updated : c)));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-serif font-bold text-nr-text flex items-center gap-3">
                    <Settings2 className="text-nr-accent" size={24} />
                    {t('admin.config.title')}
                </h1>
                <p className="text-nr-text/60">{t('admin.config.subtitle')}</p>
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
