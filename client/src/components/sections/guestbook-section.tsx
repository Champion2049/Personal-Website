import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/section-heading';
import { MessageSquare, User, Mail, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Guestbook, InsertGuestbook } from '@shared/schema';

export function GuestbookSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<Guestbook[]>({
    queryKey: ['/api/guestbook'],
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: InsertGuestbook) => {
  const response = await apiRequest('POST', '/api/guestbook', entry);
  return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guestbook'] });
      setName('');
      setEmail('');
      setMessage('');
      toast({
        title: "Success!",
        description: "Your message has been added to the guestbook.",
      });
    },
    onError: async (err: any) => {
      const msg = err?.message || "Failed to add your message";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async ({ id, secret }: { id: string, secret: string | null }) => {
      if (!secret) {
        throw new Error("Secret key is required to delete an entry.");
      }
      await apiRequest('DELETE', `/api/guestbook?id=${id}&secret=${secret}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guestbook'] });
      toast({
        title: "Deleted!",
        description: "The message has been removed from the guestbook.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete the message.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      addEntryMutation.mutate({
        name: name.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
      });
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="guestbook" className="relative py-28 md:py-36">
      <div className="container mx-auto px-6 md:px-10">
        <SectionHeading
          index="07"
          kicker="Guestbook"
          title={<>Leave a <span className="accent-text">signal</span></>}
          description="Leave a message, share your thoughts, or just say hello! I'd love to hear from you."
        />

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Add Entry Form */}
          <form data-reveal onSubmit={handleSubmit} className="panel space-y-5 p-6 lg:col-span-5" aria-labelledby="guestbook-form-title">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 id="guestbook-form-title" className="font-display text-lg font-bold uppercase tracking-wide" data-testid="guestbook-title">
                Sign the guestbook
              </h3>
              <MessageSquare size={16} className="text-primary" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="hud-label mb-2 block">
                  Name <span className="text-[var(--signal)]">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  data-testid="input-guestbook-name"
                />
              </div>
              <div>
                <label htmlFor="email" className="hud-label mb-2 block">
                  Email (optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-testid="input-guestbook-email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="hud-label mb-2 block">
                Message <span className="text-[var(--signal)]">*</span>
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, feedback, or just say hello!"
                rows={4}
                required
                data-testid="textarea-guestbook-message"
              />
            </div>
            <button
              type="submit"
              disabled={addEntryMutation.isPending || !name.trim() || !message.trim()}
              className="btn-hud w-full disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="button-submit-guestbook"
            >
              {addEntryMutation.isPending ? 'Signing…' : 'Sign guestbook'}
            </button>
          </form>

          {/* Entries List */}
          <div data-reveal className="lg:col-span-7">
            <h3 className="hud-label mb-4 flex items-center gap-3" data-testid="guestbook-description">
              Recent messages <span className="h-px flex-1 bg-[var(--line)]" /> {entries.length > 0 && <span>{String(entries.length).padStart(2, '0')}</span>}
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="panel h-28 animate-pulse" />
                ))}
              </div>
            ) : entries.length > 0 ? (
              <ul className="space-y-3">
                {entries.map((entry, index) => (
                  <li key={entry.id} className="panel p-5">
                    <div className="flex items-start gap-4">
                      <div className="grid h-9 w-9 shrink-0 place-items-center border border-primary/50 text-primary">
                        <User size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate font-display text-lg font-bold" data-testid={`guestbook-entry-name-${index}`}>
                            {entry.name}
                          </h4>
                          <button
                            className="p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                            onClick={() => {
                              const secret = prompt("Enter the admin secret to delete this message:");
                              // We don't check for null, so an empty prompt will be treated as a wrong secret.
                              deleteEntryMutation.mutate({ id: entry.id, secret });
                            }}
                            disabled={deleteEntryMutation.isPending}
                            aria-label="Delete message"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mb-3 mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                          {entry.email && (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail size={12} /> {entry.email}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} /> {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        <p className="leading-relaxed text-foreground/90" data-testid={`guestbook-entry-message-${index}`}>
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="panel grid place-items-center gap-3 px-6 py-14 text-center">
                <MessageSquare size={28} className="text-muted-foreground" />
                <p className="text-muted-foreground">No messages yet. Be the first to sign the guestbook.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}