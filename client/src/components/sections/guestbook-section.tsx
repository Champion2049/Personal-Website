import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add guestbook entry');
      }
      
      return response.json();
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add your message. Please try again.",
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
    <section id="guestbook" className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="text-center mb-12">
            <h2 className="font-space text-5xl md:text-6xl font-bold mb-6 text-foreground" data-testid="guestbook-title">
              <MessageSquare className="inline-block mr-4 text-primary" size={48} />
              Guestbook
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="guestbook-description">
              Leave a message, share your thoughts, or just say hello! I'd love to hear from you.
            </p>
          </div>

          {/* Add Entry Form */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sign the Guestbook</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name <span className="text-red-500">*</span>
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
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
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
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message <span className="text-red-500">*</span>
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
                  <Button
                    type="submit"
                    disabled={addEntryMutation.isPending || !name.trim() || !message.trim()}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="button-submit-guestbook"
                  >
                    {addEntryMutation.isPending ? 'Adding...' : 'Sign Guestbook'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Entries List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-3xl font-bold text-center mb-8">Recent Messages</h3>
            
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-effect rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="w-24 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="w-full h-16 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-400 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg" data-testid={`guestbook-entry-name-${index}`}>
                              {entry.name}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                              {entry.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail size={14} />
                                  <span>{entry.email}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(entry.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed" data-testid={`guestbook-entry-message-${index}`}>
                          {entry.message}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare size={64} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  Be the first to sign the guestbook!
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}