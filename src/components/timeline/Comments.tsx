"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText, useApi } from "@/lib/useApi";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorBox, Loading } from "@/components/ui/States";
import { inputCls } from "@/components/ui/styles";

export function Comments({ entryId, onCountChange }: { entryId: number; onCountChange: (delta: number) => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { data, error, loading, reload, setData } = useApi(() => api.timeline.comments(entryId), [entryId]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState("");

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    setPostError("");
    try {
      const c = await api.timeline.addComment(entryId, content);
      setData((prev) => [...(prev ?? []), c]);
      onCountChange(1);
      setText("");
    } catch (err) {
      setPostError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.timeline.removeComment(entryId, commentId);
      setData((prev) => prev?.filter((c) => c.id !== commentId));
      onCountChange(-1);
    } catch (err) {
      window.alert(errorText(err));
    }
  };

  return (
    <div className="pt-3 border-t border-zinc-100 space-y-3">
      {loading ? (
        <Loading label="Loading comments…" />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : data!.length === 0 ? (
        <p className="text-xs text-zinc-500">No comments yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {data!.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5 text-sm group">
              <Avatar name={c.author.name} src={c.author.avatar_url} size="sm" />
              <div className="flex-1 min-w-0 bg-zinc-50 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span>
                    <strong className="text-zinc-900">{c.author.name}</strong>
                    <span className="text-zinc-400"> · {timeAgo(c.created_at)}</span>
                  </span>
                  {user && (user.id === c.user_id || user.is_admin) && (
                    <button type="button" onClick={() => remove(c.id)} className="text-zinc-400 hover:text-red-600" aria-label="Delete comment">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-zinc-700 mt-0.5 whitespace-pre-line break-words">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={post} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Add a comment"
            aria-label="Add a comment"
            className={inputCls}
          />
          <button type="submit" disabled={busy || !text.trim()} className="btn-press px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 shrink-0" aria-label="Post comment">
            <Send size={13} />
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-500">
          <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="text-orange-600 font-medium hover:underline">
            Sign in
          </Link>{" "}
          to comment.
        </p>
      )}
      {postError && <p className="text-xs text-red-600">{postError}</p>}
    </div>
  );
}
