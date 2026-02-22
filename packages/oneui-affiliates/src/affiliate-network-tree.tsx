'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Users, User, Crown } from 'lucide-react';
import type { ReferralAttributionStatus } from '@giulio-leone/types/client';

interface NetworkNode {
  id: string;
  name: string;
  email: string;
  level: number;
  status: ReferralAttributionStatus;
  attributedAt: Date;
  children: NetworkNode[];
}

interface AffiliateNetworkTreeProps {
  referrals: Array<{
    id: string;
    level: number;
    referredName: string;
    referredEmail: string;
    status: ReferralAttributionStatus;
    attributedAt: Date;
    parentAttributionId: string | null;
    childAttributions: Array<{
      id: string;
      level: number;
      referredName: string;
      referredEmail: string;
      status: ReferralAttributionStatus;
      attributedAt: Date;
    }>;
  }>;
}

export function AffiliateNetworkTree({ referrals }: AffiliateNetworkTreeProps) {
  const t = useTranslations('affiliates');

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchical tree structure using real parent-child relationships
  type Referral = AffiliateNetworkTreeProps['referrals'][number];

  const buildTree = (referrals: AffiliateNetworkTreeProps['referrals']): NetworkNode[] => {
    const nodeMap = new Map<string, NetworkNode>();
    const roots: NetworkNode[] = [];

    // First pass: create all nodes
    referrals.forEach((referral: Referral) => {
      const node: NetworkNode = {
        id: referral.id,
        name: referral.referredName,
        email: referral.referredEmail,
        level: referral.level,
        status: referral.status,
        attributedAt: referral.attributedAt,
        children: [],
      };
      nodeMap.set(referral.id, node);
    });

    // Second pass: build parent-child relationships
    referrals.forEach((referral: Referral) => {
      const node = nodeMap.get(referral.id);
      if (!node) return;

      // Add direct children from the data
      referral.childAttributions.forEach((child) => {
        const childNode = nodeMap.get(child.id);
        if (childNode) {
          node.children.push(childNode);
        }
      });

      // If no parent, it's a root node (level 1)
      if (!referral.parentAttributionId) {
        roots.push(node);
      }
    });

    // If no explicit roots found, use level 1 nodes as roots
    if (roots.length === 0) {
      referrals
        .filter((r) => r.level === 1)
        .forEach((referral) => {
          const node = nodeMap.get(referral.id);
          if (node && !roots.includes(node)) {
            roots.push(node);
          }
        });
    }

    return roots.length > 0 ? roots : Array.from(nodeMap.values()).filter((n) => n.level === 1);
  };

  const tree = buildTree(referrals);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: ReferralAttributionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 2:
        return <Users className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-neutral-500 dark:text-neutral-500" />;
    }
  };

  const TreeNode = ({ node, depth = 0 }: { node: NetworkNode; depth?: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 transition-all hover:shadow-sm ${getStatusColor(
            node.status
          )}`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex-shrink-0 rounded p-1 transition-colors hover:bg-black/5"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex flex-shrink-0 items-center gap-2">{getLevelIcon(node.level)}</div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{node.name}</p>
            <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">{node.email}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-white px-2 py-1 font-medium dark:bg-neutral-900/80">
              L{node.level}
            </span>
            <span className="rounded-full bg-white px-2 py-1 font-medium dark:bg-neutral-900/80">
              {node.status}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children.map((child: NetworkNode) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (referrals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-600 dark:bg-neutral-900">
        <Users className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
        <h3 className="mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {t('affiliates.affiliate_network_tree.nessuna_rete_di_referral')}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
          {t('affiliates.affiliate_network_tree.condividi_il_tuo_codice_referral_per_ini')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('affiliates.affiliate_network_tree.la_tua_rete_di_referral')}
        </h3>
        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>{t('affiliates.affiliate_network_tree.livello_1')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{t('affiliates.affiliate_network_tree.livello_2')}</span>
          </div>
        </div>
      </div>

      <div className="max-h-96 space-y-1 overflow-y-auto">
        {tree.map((node: NetworkNode) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {t('affiliates.affiliate_network_tree.total_referrals')}
          {referrals.length} {t('affiliates.affiliate_network_tree.attivi')}{' '}
          {referrals.filter((r) => r.status === 'ACTIVE').length}{' '}
          {t('affiliates.affiliate_network_tree.cancellati')}{' '}
          {referrals.filter((r) => r.status === 'CANCELLED').length}
        </p>
      </div>
    </div>
  );
}
