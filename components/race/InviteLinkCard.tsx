"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type InviteLinkCardProps = {
  shareUrl: string;
};

export function InviteLinkCard({ shareUrl }: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — host can select the URL manually
    }
  };

  return (
    <div className="rounded-sm border border-lane bg-asphalt-raised p-4">
      <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
        Invite friends
      </p>
      <p className="mt-2 text-sm text-chalk-muted">
        Share this link so others can join your race session.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <code className="min-w-0 flex-1 truncate rounded-sm border border-lane bg-asphalt px-3 py-2.5 font-mono text-xs text-cyan sm:text-sm">
          {shareUrl}
        </code>
        <Button type="button" size="sm" onClick={() => void copy()} className="shrink-0">
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
