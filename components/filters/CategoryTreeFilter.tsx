"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryNode } from "@/lib/types";
import { DUR, EASE } from "@/lib/motion";
import { Checkbox } from "./Checkbox";

interface CategoryTreeFilterProps {
  tree: CategoryNode[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Árbol de categorías respetando `parent_id`, con expandir/colapsar por
 * nodo (animación de altura). Selección única: la categoría elegida ya
 * incluye a sus descendientes al aplicar el filtro (ver
 * getCategoryDescendantIds en lib/supabase/queries.ts).
 */
export function CategoryTreeFilter({ tree, value, onChange }: CategoryTreeFilterProps) {
  return (
    <div>
      <CategoryOption
        label="Todas las categorías"
        selected={value === ""}
        onSelect={() => onChange("")}
      />
      <ul>
        {tree.map((node) => (
          <CategoryTreeNode
            key={node.id}
            node={node}
            value={value}
            onChange={onChange}
          />
        ))}
      </ul>
    </div>
  );
}

function CategoryTreeNode({
  node,
  value,
  onChange,
  depth = 0,
}: {
  node: CategoryNode;
  value: string;
  onChange: (value: string) => void;
  depth?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isAncestorOfSelected = hasChildren && containsId(node, value);
  const [expanded, setExpanded] = useState(isAncestorOfSelected);

  return (
    <li style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center">
        <CategoryOption
          label={node.name}
          selected={value === node.id}
          onSelect={() => onChange(node.id)}
        />
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Colapsar" : "Expandir"} ${node.name}`}
            className="mono flex h-[34px] w-8 shrink-0 items-center justify-center text-text-3 transition-colors duration-fast ease-zara hover:text-ink"
          >
            <span aria-hidden>{expanded ? "—" : "+"}</span>
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="overflow-hidden"
            >
              <ul>
                {node.children.map((child) => (
                  <CategoryTreeNode
                    key={child.id}
                    node={child}
                    value={value}
                    onChange={onChange}
                    depth={depth + 1}
                  />
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </li>
  );
}

function CategoryOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex min-h-[34px] flex-1 items-center gap-[11px] text-left text-ui uppercase tracking-[0.02em] transition-opacity duration-fast ease-zara hover:opacity-60"
    >
      <Checkbox checked={selected} />
      <span className={selected ? "text-ink" : "text-text-2"}>{label}</span>
    </button>
  );
}

function containsId(node: CategoryNode, id: string): boolean {
  if (!id) return false;
  return node.children.some(
    (child) => child.id === id || containsId(child, id),
  );
}
