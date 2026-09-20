import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Key, Link2, Table2 } from 'lucide-react';
import type { SchemaTable } from '@/types';

interface SchemaViewerProps {
  tables: SchemaTable[];
}

export default function SchemaViewer({ tables }: SchemaViewerProps) {
  const [expanded, setExpanded] = useState<string | null>(tables[0]?.name ?? null);

  return (
    <div>
      {/* Desktop: diagram-style grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table, i) => {
          const isExpanded = expanded === table.name;
          return (
            <motion.div
              key={table.name}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`card cursor-pointer bg-theme-card border transition-all ${
                isExpanded
                  ? 'border-theme-accent shadow-md'
                  : 'border-theme-border hover:border-theme-accent/40'
              }`}
              onClick={() => setExpanded(isExpanded ? null : table.name)}
            >
              <div className="px-4 py-3 border-b border-theme-border bg-theme-bg-sec/50 flex items-center gap-2">
                <Table2 className="w-4 h-4 text-theme-accent" />
                <span className="font-mono text-sm font-bold text-theme-text">{table.name}</span>
                <ChevronDown
                  className={`w-4 h-4 ms-auto text-theme-muted transition-transform ${
                    isExpanded ? 'rotate-180 text-theme-accent' : ''
                  }`}
                />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center gap-2 text-xs py-0.5 border-b border-theme-border/50 last:border-0"
                        >
                          {col.isPrimaryKey && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                          {col.isForeignKey && <Link2 className="w-3 h-3 text-theme-accent shrink-0" />}
                          {!col.isPrimaryKey && !col.isForeignKey && <span className="w-3 shrink-0" />}
                          <span className="font-mono font-medium text-theme-text">{col.name}</span>
                          <span className="font-mono text-theme-muted ms-auto text-[11px]">
                            {col.type}
                          </span>
                        </div>
                      ))}
                      {table.relationships.length > 0 && (
                        <div className="pt-2.5 mt-2 border-t border-theme-border">
                          <p className="text-[10px] font-bold text-theme-muted mb-1.5 uppercase tracking-wider">
                            Relationships
                          </p>
                          {table.relationships.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] font-mono text-theme-accent"
                            >
                              <span>{rel.fromColumn}</span>
                              <span className="text-theme-muted">→</span>
                              <span>
                                {rel.toTable}.{rel.toColumn}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: accordion */}
      <div className="md:hidden space-y-3">
        {tables.map((table) => {
          const isExpanded = expanded === table.name;
          return (
            <div
              key={table.name}
              className="card overflow-hidden bg-theme-card border border-theme-border"
            >
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : table.name)}
                className="w-full px-4 py-3 flex items-center gap-2 bg-theme-bg-sec/50"
                aria-label={`Toggle ${table.name} details`}
              >
                <Table2 className="w-4 h-4 text-theme-accent" />
                <span className="font-mono text-sm font-bold text-theme-text">{table.name}</span>
                <ChevronDown
                  className={`w-4 h-4 ms-auto text-theme-muted transition-transform ${
                    isExpanded ? 'rotate-180 text-theme-accent' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center gap-2 text-xs py-0.5 border-b border-theme-border/50 last:border-0"
                        >
                          {col.isPrimaryKey && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                          {col.isForeignKey && <Link2 className="w-3 h-3 text-theme-accent shrink-0" />}
                          {!col.isPrimaryKey && !col.isForeignKey && <span className="w-3 shrink-0" />}
                          <span className="font-mono font-medium text-theme-text">{col.name}</span>
                          <span className="font-mono text-theme-muted ms-auto text-[11px]">
                            {col.type}
                          </span>
                        </div>
                      ))}
                      {table.relationships.length > 0 && (
                        <div className="pt-2.5 mt-2 border-t border-theme-border">
                          <p className="text-[10px] font-bold text-theme-muted mb-1.5 uppercase tracking-wider">
                            Relationships
                          </p>
                          {table.relationships.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] font-mono text-theme-accent"
                            >
                              <span>{rel.fromColumn}</span>
                              <span className="text-theme-muted">→</span>
                              <span>
                                {rel.toTable}.{rel.toColumn}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
