import { useEffect, useMemo, useState } from 'react';
import {
  AtSign,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  Phone,
  Search,
  Star,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getContactSubmissions, markContactAsRead, type ContactSubmission } from '@/lib/api';

type LeadStatus = 'new' | 'contacted' | 'quote' | 'won' | 'lost';
type LeadPriority = 'normal' | 'hot';

interface CrmMeta {
  status: LeadStatus;
  priority: LeadPriority;
  notes: string;
  nextFollowUp: string;
}

const CRM_STORAGE_KEY = 'albasha_crm_leads';

const statuses: Array<{ key: LeadStatus; label: string; color: string }> = [
  { key: 'new', label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'contacted', label: 'Contacted', color: 'bg-slate-50 text-slate-700 border-slate-100' },
  { key: 'quote', label: 'Quote', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { key: 'won', label: 'Won', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'lost', label: 'Lost', color: 'bg-red-50 text-red-700 border-red-100' },
];

const defaultMeta: CrmMeta = {
  status: 'new',
  priority: 'normal',
  notes: '',
  nextFollowUp: '',
};

function getLeadId(lead: ContactSubmission) {
  return String(lead.id ?? `${lead.email}-${lead.mobile}`);
}

function loadMeta(): Record<string, CrmMeta> {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function formatPhoneForWhatsapp(phone?: string) {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

export default function CrmManager() {
  const [leads, setLeads] = useState<ContactSubmission[]>([]);
  const [metaById, setMetaById] = useState<Record<string, CrmMeta>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMetaById(loadMeta());

    async function loadLeads() {
      setLoading(true);
      const data = await getContactSubmissions();
      setLeads(data);
      setSelectedId(data[0] ? getLeadId(data[0]) : null);
      setLoading(false);
    }

    loadLeads();
  }, []);

  const saveMeta = (leadId: string, updates: Partial<CrmMeta>) => {
    setMetaById((current) => {
      const next = {
        ...current,
        [leadId]: { ...defaultMeta, ...(current[leadId] || {}), ...updates },
      };
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.mobile, lead.email, lead.message]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [leads, query]);

  const selectedLead = leads.find((lead) => getLeadId(lead) === selectedId) || null;
  const selectedMeta = selectedLead ? { ...defaultMeta, ...(metaById[getLeadId(selectedLead)] || {}) } : defaultMeta;

  const pipeline = statuses.map((status) => ({
    ...status,
    count: leads.filter((lead) => ({ ...defaultMeta, ...(metaById[getLeadId(lead)] || {}) }).status === status.key).length,
  }));

  const hotLeads = leads.filter((lead) => ({ ...defaultMeta, ...(metaById[getLeadId(lead)] || {}) }).priority === 'hot').length;
  const followUps = leads.filter((lead) => {
    const followUp = metaById[getLeadId(lead)]?.nextFollowUp;
    return followUp && new Date(followUp) <= new Date();
  }).length;

  const handleOpenLead = async (lead: ContactSubmission) => {
    const leadId = getLeadId(lead);
    setSelectedId(leadId);
    if (lead.id && !lead.read) {
      await markContactAsRead(lead.id);
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, read: true } : item)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="ltr">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-sm text-gray-500">Manage leads from contact forms, calls, WhatsApp, and follow-ups.</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total leads" value={leads.length} />
        <Metric label="Hot leads" value={hotLeads} />
        <Metric label="Due follow-ups" value={followUps} />
        <Metric label="Won" value={pipeline.find((item) => item.key === 'won')?.count || 0} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {pipeline.map((item) => (
          <button key={item.key} className={`rounded-lg border p-4 text-left ${item.color}`}>
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-2xl font-bold">{item.count}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Leads</p>
          </div>
          <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-50">
            {filteredLeads.map((lead) => {
              const leadId = getLeadId(lead);
              const meta = { ...defaultMeta, ...(metaById[leadId] || {}) };
              return (
                <button
                  key={leadId}
                  onClick={() => handleOpenLead(lead)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${selectedId === leadId ? 'bg-gold/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{lead.name || 'Unnamed lead'}</p>
                      <p className="text-xs text-gray-500 truncate">{lead.mobile || lead.email}</p>
                    </div>
                    {meta.priority === 'hot' && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{meta.status}</span>
                    {!lead.read && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">new</span>}
                  </div>
                </button>
              );
            })}
            {filteredLeads.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No leads found.</div>}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5">
          {selectedLead ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-gold" />
                    <h2 className="text-xl font-bold text-gray-900">{selectedLead.name || 'Lead'}</h2>
                  </div>
                  {selectedLead.created_at && (
                    <p className="mt-1 text-xs text-gray-400">Created {new Date(selectedLead.created_at).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600" href={`https://wa.me/${formatPhoneForWhatsapp(selectedLead.mobile)}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600" href={`tel:${selectedLead.mobile}`}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <a className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800" href={`mailto:${selectedLead.email}`}>
                    <AtSign className="h-4 w-4" />
                    Email
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <Info label="Phone" value={selectedLead.mobile || '-'} />
                <Info label="Email" value={selectedLead.email || '-'} />
              </div>

              {selectedLead.message && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">Original message</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{selectedLead.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <select value={selectedMeta.status} onChange={(event) => saveMeta(getLeadId(selectedLead), { status: event.target.value as LeadStatus })} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {statuses.map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <select value={selectedMeta.priority} onChange={(event) => saveMeta(getLeadId(selectedLead), { priority: event.target.value as LeadPriority })} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="normal">Normal</option>
                    <option value="hot">Hot</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Next follow-up</span>
                  <Input type="datetime-local" value={selectedMeta.nextFollowUp} onChange={(event) => saveMeta(getLeadId(selectedLead), { nextFollowUp: event.target.value })} />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-700">CRM notes</span>
                <Textarea value={selectedMeta.notes} onChange={(event) => saveMeta(getLeadId(selectedLead), { notes: event.target.value })} placeholder="Add call notes, quote details, measurements, or delivery preferences" rows={6} />
              </label>

              <Button onClick={() => toast.success('CRM lead saved')} className="bg-gold hover:bg-gold/90 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved automatically
              </Button>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-gray-400">
              <CalendarClock className="mb-3 h-12 w-12 text-gray-300" />
              <p>Select a lead to manage CRM details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900" dir="ltr">{value}</p>
    </div>
  );
}
