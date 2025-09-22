"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Simple chat UI between current user and profile id from route param
export default function MessagesPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const conversationId = params?.id;
  const supabase = createClient();

  const [messages, setMessages] = useState<Array<any>>([]);
  const [loadError, setLoadError] = useState<any | null>(null);
  const [sendError, setSendError] = useState<any | null>(null);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id ?? null;
      if (!mounted) return;
      setUserId(uid);

      if (!uid || !conversationId) return;

      // load existing messages for this conversation
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('load messages error', error);
        setLoadError(error);
      } else if (mounted) setMessages(data || []);

      // subscribe to new messages for this conversation
      const channel = supabase.channel(`public:messages:conversation:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const newMsg = payload.new as any;
          if (newMsg.conversation_id === conversationId) {
            setMessages(prev => [...prev, newMsg]);
            // scroll to bottom
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
          }
        })
        .subscribe();

      return () => {
        mounted = false;
        channel.unsubscribe();
      };
    };

    init();
    return () => { mounted = false; };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim() || !userId || !conversationId) return;
    const payload = {
      conversation_id: conversationId,
      sender_id: userId,
      content: text.trim(),
      is_read: false,
    };
    const { data, error } = await supabase.from('messages').insert([payload]).select();
    if (error) {
      console.error('send message error', error);
      setSendError(error);
      return;
    }
    setSendError(null);
    setText('');
    // message will be appended by realtime subscription
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-4 flex flex-col">
        <div className="border-b pb-3 mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <button onClick={() => router.back()} className="text-sm text-gray-600">Back</button>
        </div>

        <div className="flex-1 overflow-auto h-96 p-3" ref={listRef}>
          {loadError ? (
            <div className="text-red-600">Error loading messages: {String(loadError.message ?? loadError)}. Check console for details.</div>
          ) : (
            messages.map((m: any) => (
            <div key={m.id} className={`mb-3 max-w-[80%] ${m.sender_id === userId ? 'ml-auto text-right' : ''}`}>
              <div className={`${m.sender_id === userId ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'} inline-block px-3 py-2 rounded-lg`}>{m.content}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(m.sent_at).toLocaleString()}</div>
            </div>
            ))
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." className="flex-1 border rounded p-2" />
          <button onClick={sendMessage} className="px-4 py-2 bg-green-600 text-white rounded">Send</button>
        </div>
        {sendError && (
          <div className="mt-2 text-sm text-red-600">Error sending message: {String(sendError.message ?? sendError)} — check console for full details.</div>
        )}
      </div>
    </div>
  );
}
