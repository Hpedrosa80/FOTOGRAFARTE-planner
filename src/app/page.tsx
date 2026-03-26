"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Calendar,
  Clock,
  Heart,
  Phone,
  Mail,
  MapPin,
  Camera,
  Video,
  Euro,
  FileText,
  Plus,
  Search,
  Trash2,
  Pencil,
  Save,
  RotateCcw,
  ChevronDown,
  CheckSquare,
  Users,
  Church,
  Home,
} from "lucide-react";

type WeddingStatus = "Pendente" | "Confirmado" | "Editado" | "Entregue";

type ChecklistKey =
  | "contractSigned"
  | "signalReceived"
  | "bachelorPartyDone"
  | "weddingDone"
  | "paymentCompleted"
  | "editingInProgress"
  | "albumProofed"
  | "albumLab"
  | "filmCompleted"
  | "galleryDelivered";

type WeddingChecklist = Record<ChecklistKey, boolean>;

type Wedding = {
  id: number;
  couple: string;
  brideName: string;
  groomName: string;
  bridePhone: string;
  groomPhone: string;
  brideEmail: string;
  groomEmail: string;
  date: string;
  venue: string;
  venueName: string;
  churchLocation: string;
  bridePrepLocation: string;
  groomPrepLocation: string;
  status: WeddingStatus;
  phone: string;
  email: string;
  package: string;
  total: string;
  signal: string;
  secondSignal: string;
  thirdSignal: string;
  balance: string;
  ceremony: string;
  bridePrepTime: string;
  groomPrepTime: string;
  delivery: string;
  notes: string;
  teamCosts: string;
  laboratoryCosts: string;
  extraCosts: string;
  checklist: WeddingChecklist;
};

const checklistLabels: { key: ChecklistKey; label: string }[] = [
  { key: "contractSigned", label: "Contrato assinado" },
  { key: "signalReceived", label: "Sinal recebido" },
  { key: "bachelorPartyDone", label: "Sessão de solteiros realizada" },
  { key: "weddingDone", label: "Casamento realizado" },
  { key: "paymentCompleted", label: "Pagamento concluído" },
  { key: "editingInProgress", label: "Edição em curso" },
  { key: "albumProofed", label: "Álbum paginado" },
  { key: "albumLab", label: "Álbum laboratório" },
  { key: "filmCompleted", label: "Filme concluído" },
  { key: "galleryDelivered", label: "Galeria entregue" },
];

const packOptions = [
  "Pack 1 foto",
  "Pack 2 foto",
  "Pack 3 foto",
  "Pack 1 video",
  "Pack 2 video",
];

const emptyChecklist: WeddingChecklist = {
  contractSigned: false,
  signalReceived: false,
  bachelorPartyDone: false,
  weddingDone: false,
  paymentCompleted: false,
  editingInProgress: false,
  albumProofed: false,
  albumLab: false,
  filmCompleted: false,
  galleryDelivered: false,
};

const defaultWeddings: Wedding[] = [
  {
    id: 1,
    couple: "Inês & Ricardo",
    brideName: "Inês",
    groomName: "Ricardo",
    bridePhone: "+351 912 345 678",
    groomPhone: "+351 913 222 999",
    brideEmail: "ines@email.com",
    groomEmail: "ricardo@email.com",
    date: "2026-07-18",
    venue: "Quinta Dalvre",
    venueName: "Quinta Dalvre",
    churchLocation: "Igreja de São Francisco, Porto",
    bridePrepLocation: "Hotel Vincci Porto",
    groomPrepLocation: "Casa dos pais do noivo",
    status: "Confirmado",
    phone: "+351 912 345 678",
    email: "ines@email.com",
    package: "Foto + Vídeo",
    total: "2500€",
    signal: "750€",
    secondSignal: "750€",
    thirdSignal: "0€",
    balance: "1000€",
    ceremony: "15:00",
    bridePrepTime: "09:30",
    groomPrepTime: "10:00",
    delivery: "Teaser + Filme + Galeria",
    notes:
      "Querem imagens românticas ao pôr do sol, drone no exterior da quinta e teaser emocional para Instagram.",
    teamCosts: "400€",
    laboratoryCosts: "200€",
    extraCosts: "",
    checklist: {
      ...emptyChecklist,
      contractSigned: true,
      signalReceived: true,
      weddingDone: true,
    },
  },
  {
    id: 2,
    couple: "Sofia & Miguel",
    brideName: "Sofia",
    groomName: "Miguel",
    bridePhone: "+351 934 222 111",
    groomPhone: "+351 935 444 777",
    brideEmail: "sofia@email.com",
    groomEmail: "miguel@email.com",
    date: "2026-09-05",
    venue: "Barco Rabelo - Douro",
    venueName: "Barco Rabelo - Douro",
    churchLocation: "Sem igreja definida",
    bridePrepLocation: "The Yeatman",
    groomPrepLocation: "Apartamento do casal",
    status: "Pendente",
    phone: "+351 934 222 111",
    email: "sofia@email.com",
    package: "Fotografia",
    total: "1800€",
    signal: "500€",
    secondSignal: "",
    thirdSignal: "",
    balance: "1300€",
    ceremony: "16:30",
    bridePrepTime: "10:00",
    groomPrepTime: "10:30",
    delivery: "Galeria online",
    notes:
      "Falta fechar timeline final, música do teaser e lista de grupos para fotografar.",
    teamCosts: "300€",
    laboratoryCosts: "150€",
    extraCosts: "",
    checklist: {
      ...emptyChecklist,
      signalReceived: true,
    },
  },
];

const STORAGE_KEY = "fotografarte-weddings-v4";
const SYNC_ROW_ID = "main";

function parseMoneyValue(value: unknown) {
  const normalizedValue = typeof value === "string" ? value : "";
  const sanitized = normalizedValue.replace(/[^\d,.-]/g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyValue(value: number) {
  if (value <= 0) return "0€";
  const isInteger = Number.isInteger(value);
  const formatted = isInteger
    ? value.toString()
    : value.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${formatted}€`;
}

function calculateBalance(
  total: string,
  signal: string,
  secondSignal: string,
  thirdSignal: string
) {
  const remaining =
    parseMoneyValue(total) -
    parseMoneyValue(signal) -
    parseMoneyValue(secondSignal) -
    parseMoneyValue(thirdSignal);
  return formatMoneyValue(Math.max(remaining, 0));
}

function normalizeWeddings(list: Wedding[]) {
  return list.map((w) => ({
    ...w,
    total: w.total || "",
    signal: w.signal || "",
    secondSignal: w.secondSignal || "",
    thirdSignal: w.thirdSignal || "",
    balance: calculateBalance(
      w.total || "",
      w.signal || "",
      w.secondSignal || "",
      w.thirdSignal || ""
    ),
    checklist: { ...emptyChecklist, ...(w.checklist || {}) },
  }));
}

const emptyForm: Omit<Wedding, "id"> = {
  couple: "",
  brideName: "",
  groomName: "",
  bridePhone: "",
  groomPhone: "",
  brideEmail: "",
  groomEmail: "",
  date: "",
  venue: "",
  venueName: "",
  churchLocation: "",
  bridePrepLocation: "",
  groomPrepLocation: "",
  status: "Pendente",
  phone: "",
  email: "",
  package: "",
  total: "",
  signal: "",
  secondSignal: "",
  thirdSignal: "",
  balance: "",
  ceremony: "",
  bridePrepTime: "",
  groomPrepTime: "",
  delivery: "",
  notes: "",
  teamCosts: "",
  laboratoryCosts: "",
  extraCosts: "",
  checklist: { ...emptyChecklist },
};

const statusStyles: Record<WeddingStatus, string> = {
  Pendente: "bg-[#efe4d6] text-[#7f6548] border-[#cdb79c]",
  Confirmado: "bg-[#eef0e7] text-[#5d6b43] border-[#d9ddcf]",
  Editado: "bg-[#f6ede3] text-[#9b7553] border-[#dcc7b0]",
  Entregue: "bg-[#efe4d6] text-[#7b6958] border-[#cdb79c]",
};

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-sm text-[#3f3125] outline-none transition placeholder:text-xs placeholder:text-[#9c8974] focus:border-[#8c6a43] ${className}`}
    />
  );
}

function DateInputField({
  value,
  onChange,
  placeholder = "DATA do casamento",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const displayValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-PT")
    : placeholder;

  return (
    <div className="relative">
      <div
        className={`w-full rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-sm outline-none transition ${
          value ? "text-[#3f3125]" : "text-[#9c8974]"
        }`}
      >
        {displayValue}
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => inputRef.current?.showPicker?.()}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={placeholder}
      />
    </div>
  );
}

function FinanceInputCard({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] p-2.5">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8c6a43]">
        {label}
      </label>
      <InputField
        placeholder={label}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="bg-white px-2.5 py-2 text-xs"
      />
    </div>
  );
}

function FinanceSummaryCard({
  label,
  value,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] p-3 ${className}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8c6a43]">
        {label}
      </div>
      <div className={`mt-1 text-sm font-medium text-[#3f3125] ${valueClassName}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function getSelectedPacks(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function calculateWeddingProfit(wedding: Pick<Wedding, "total" | "teamCosts" | "laboratoryCosts" | "extraCosts">) {
  return (
    parseMoneyValue(wedding.total) -
    parseMoneyValue(wedding.teamCosts) -
    parseMoneyValue(wedding.laboratoryCosts) -
    parseMoneyValue(wedding.extraCosts)
  );
}

function getDaysUntilWedding(dateString: string) {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weddingDate = new Date(dateString);
  weddingDate.setHours(0, 0, 0, 0);

  const diffMs = weddingDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function isUpcomingSoon(dateString: string, days = 30) {
  const daysUntilWedding = getDaysUntilWedding(dateString);
  return daysUntilWedding !== null && daysUntilWedding >= 0 && daysUntilWedding <= days;
}

function hasPendingPayment(wedding: Pick<Wedding, "balance">) {
  return parseMoneyValue(wedding.balance) > 0;
}

function togglePackSelection(currentValue: string, packLabel: string) {
  const selectedPacks = getSelectedPacks(currentValue);
  const nextSelection = selectedPacks.includes(packLabel)
    ? selectedPacks.filter((item) => item !== packLabel)
    : [...selectedPacks, packLabel];

  return nextSelection.join(", ");
}

function PackageSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedPacks = getSelectedPacks(value);
  const hasCustomValue = value.trim().length > 0 && selectedPacks.length === 0;

  return (
    <div className="rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8c6a43]">
          Pack contratado
        </label>
        <span className="text-[11px] text-[#7b6958]">Escolha múltipla</span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {packOptions.map((packLabel) => {
          const isSelected = selectedPacks.includes(packLabel);

          return (
            <button
              key={packLabel}
              type="button"
              onClick={() => onChange(togglePackSelection(value, packLabel))}
              className={`rounded-2xl border px-3 py-2 text-left text-xs font-medium transition ${
                isSelected
                  ? "border-[#8c6a43] bg-[#8c6a43] text-white"
                  : "border-[#dbcbb7] bg-[#fffaf3] text-[#5e4a3a] hover:border-[#8c6a43]"
              }`}
            >
              {packLabel}
            </button>
          );
        })}
      </div>
      {hasCustomValue ? (
        <div className="mt-2 text-[11px] text-[#a75d4d]">
          Pack atual fora da lista: {value}
        </div>
      ) : null}
    </div>
  );
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isSameMonth(dateString: string, monthDate: Date) {
  const d = new Date(dateString);
  return (
    d.getFullYear() === monthDate.getFullYear() &&
    d.getMonth() === monthDate.getMonth()
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7b6958]">
      {icon}
      <span>{title}</span>
    </div>
  );
}

// iCal export functions
function formatICalDate(dateString: string, timeString?: string): string {
  const date = new Date(dateString);
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
  }
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICalContent(weddings: Wedding[]): string {
  const events: string[] = [];

  weddings.forEach((wedding, index) => {
    const baseId = `fotografarte-wedding-${wedding.id}`;

    // Main ceremony event
    if (wedding.ceremony) {
      const eventId = `${baseId}-ceremony`;
      const startDate = formatICalDate(wedding.date, wedding.ceremony);
      // Add 1 hour duration for ceremony
      const endDateObj = new Date(wedding.date);
      const [hours, minutes] = wedding.ceremony.split(':');
      endDateObj.setHours(parseInt(hours) + 1, parseInt(minutes));
      const endDate = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      events.push(`BEGIN:VEVENT
UID:${eventId}@fotografarte.pt
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Cerimónia - ${wedding.couple}
DESCRIPTION:Casamento de ${wedding.couple}\\nLocal: ${wedding.venueName || wedding.venue}\\nContacto: ${wedding.phone}
LOCATION:${wedding.churchLocation || wedding.venueName || wedding.venue}
STATUS:CONFIRMED
END:VEVENT`);
    }

    // Bride preparation event
    if (wedding.bridePrepTime) {
      const eventId = `${baseId}-bride-prep`;
      const startDate = formatICalDate(wedding.date, wedding.bridePrepTime);
      // Add 2 hours duration for bride preparation
      const endDateObj = new Date(wedding.date);
      const [hours, minutes] = wedding.bridePrepTime.split(':');
      endDateObj.setHours(parseInt(hours) + 2, parseInt(minutes));
      const endDate = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      events.push(`BEGIN:VEVENT
UID:${eventId}@fotografarte.pt
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Preparação da Noiva - ${wedding.brideName}
DESCRIPTION:Preparação da noiva para o casamento de ${wedding.couple}
LOCATION:${wedding.bridePrepLocation || 'A definir'}
STATUS:CONFIRMED
END:VEVENT`);
    }

    // Groom preparation event
    if (wedding.groomPrepTime) {
      const eventId = `${baseId}-groom-prep`;
      const startDate = formatICalDate(wedding.date, wedding.groomPrepTime);
      // Add 2 hours duration for groom preparation
      const endDateObj = new Date(wedding.date);
      const [hours, minutes] = wedding.groomPrepTime.split(':');
      endDateObj.setHours(parseInt(hours) + 2, parseInt(minutes));
      const endDate = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      events.push(`BEGIN:VEVENT
UID:${eventId}@fotografarte.pt
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Preparação do Noivo - ${wedding.groomName}
DESCRIPTION:Preparação do noivo para o casamento de ${wedding.couple}
LOCATION:${wedding.groomPrepLocation || 'A definir'}
STATUS:CONFIRMED
END:VEVENT`);
    }
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fotografarte//Wedding Planner//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Casamentos Fotografarte
X-WR-TIMEZONE:Europe/Lisbon
${events.join('\n')}
END:VCALENDAR`;
}

function downloadICalFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseICal(icalContent: string): Partial<Wedding>[] {
  const events: Partial<Wedding>[] = [];
  const lines = icalContent.split('\n');
  let currentEvent: Partial<Wedding> | null = null;
  let inEvent = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'BEGIN:VEVENT') {
      currentEvent = {};
      inEvent = true;
    } else if (trimmed === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = null;
      inEvent = false;
    } else if (inEvent && currentEvent && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':');
      
      switch (key) {
        case 'SUMMARY':
          currentEvent.couple = value;
          // Try to extract bride and groom names from summary like "Casamento Ana & João"
          const nameMatch = value.match(/(.+?)\s*&\s*(.+)/);
          if (nameMatch) {
            currentEvent.brideName = nameMatch[1].trim();
            currentEvent.groomName = nameMatch[2].trim();
          }
          break;
        case 'DTSTART':
          // Handle both date-time and date formats
          if (value.length === 8) { // YYYYMMDD
            const year = value.slice(0, 4);
            const month = value.slice(4, 6);
            const day = value.slice(6, 8);
            currentEvent.date = `${year}-${month}-${day}`;
          } else if (value.includes('T')) { // Date-time
            const dateTime = new Date(value.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z'));
            currentEvent.date = dateTime.toISOString().split('T')[0];
            // Extract time if available
            const timeStr = dateTime.toTimeString().slice(0, 5);
            if (timeStr !== '00:00') {
              currentEvent.ceremony = timeStr;
            }
          }
          break;
        case 'LOCATION':
          currentEvent.venue = value;
          currentEvent.venueName = value;
          // Try to identify church locations
          if (value.toLowerCase().includes('igreja') || value.toLowerCase().includes('church')) {
            currentEvent.churchLocation = value;
          }
          break;
        case 'DESCRIPTION':
          currentEvent.notes = value;
          // Try to extract contact info from description
          const phoneMatch = value.match(/(\+?351\s*\d{1,3}[\s\.\-]?\d{1,3}[\s\.\-]?\d{1,3}[\s\.\-]?\d{1,3})/);
          if (phoneMatch) {
            currentEvent.phone = phoneMatch[1];
          }
          const emailMatch = value.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            currentEvent.email = emailMatch[1];
          }
          break;
      }
    }
  }

  return events;
}

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [deletedWedding, setDeletedWedding] = useState<Wedding | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Wedding, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Wedding, "id">>(emptyForm);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState<"cloud" | "local">("local");
  const [mobileSection, setMobileSection] = useState<"agenda" | "couple" | "add">("agenda");
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [mobileSummaryVisibility, setMobileSummaryVisibility] = useState({
    revenue: false,
    profit: false,
  });
  const [syncHint, setSyncHint] = useState(
    "Sincronização local (define as chaves do Supabase para sincronizar com o telemóvel)."
  );
  const [yearFilter, setYearFilter] = useState<"all" | "current" | "next" | "currentNext">("current");
  const [currentMonth, setCurrentMonth] = useState(() => {    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const localData = saved
        ? normalizeWeddings(JSON.parse(saved) as Wedding[])
        : normalizeWeddings(defaultWeddings);

      let initialData = localData;

      if (supabase) {
        const { data, error } = await supabase
          .from("planner_state")
          .select("payload, updated_at")
          .eq("id", SYNC_ROW_ID)
          .maybeSingle();

        if (!error && data?.payload && Array.isArray(data.payload)) {
          initialData = normalizeWeddings(data.payload as Wedding[]);
          setSyncMode("cloud");
          setSyncHint("Sincronização com telemóvel ativa via Supabase.");
          if (data.updated_at) {
            setLastSync(new Date(data.updated_at).toLocaleString("pt-PT"));
          }
        } else if (!error && !data) {
          await supabase
            .from("planner_state")
            .upsert(
              {
                id: SYNC_ROW_ID,
                payload: localData,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          setSyncMode("cloud");
          setSyncHint("Sincronização com telemóvel ativa via Supabase.");
        } else if (error) {
          setSyncHint(
            "Cloud indisponível. A usar modo local. Verifica tabela planner_state e variáveis Supabase."
          );
        }
      }

      if (cancelled) return;
      setWeddings(initialData);
      setSelectedId(initialData[0]?.id ?? null);
      setIsLoaded(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weddings));

    if (!supabase) return;
    const client = supabase;

    const timer = setTimeout(async () => {
      setIsCloudSyncing(true);
      const { error } = await client
        .from("planner_state")
        .upsert(
          {
            id: SYNC_ROW_ID,
            payload: weddings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (!error) {
        setSyncMode("cloud");
        setSyncHint("Sincronização com telemóvel ativa via Supabase.");
        setLastSync(new Date().toLocaleString("pt-PT"));
      }
      setIsCloudSyncing(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [weddings, isLoaded]);

  const refreshFromCloud = async () => {
    if (!supabase) {
      alert("Configura Supabase para sincronizar com o telemóvel.");
      return;
    }

    setIsCloudSyncing(true);
    const { data, error } = await supabase
      .from("planner_state")
      .select("payload, updated_at")
      .eq("id", SYNC_ROW_ID)
      .maybeSingle();

    if (error || !data?.payload || !Array.isArray(data.payload)) {
      setIsCloudSyncing(false);
      alert("Não foi possível atualizar da cloud.");
      return;
    }

    const cloudData = normalizeWeddings(data.payload as Wedding[]);
    setWeddings(cloudData);
    setSelectedId(cloudData[0]?.id ?? null);
    if (data.updated_at) {
      setLastSync(new Date(data.updated_at).toLocaleString("pt-PT"));
    }
    setSyncMode("cloud");
    setSyncHint("Dados atualizados da cloud com sucesso.");
    setIsCloudSyncing(false);
  };

  const filteredWeddings = useMemo(() => {
    return weddings
      .filter((w) =>
        [
          w.couple,
          w.brideName,
          w.groomName,
          w.venue,
          w.venueName,
          w.churchLocation,
          w.date,
          w.status,
          w.package,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weddings, search]);

  const selectedWedding = weddings.find((w) => w.id === selectedId) || null;

  const filteredByYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return filteredWeddings.filter((w) => {
      const d = new Date(w.date);
      if (yearFilter === "all") return true;
      if (yearFilter === "current") return d.getFullYear() === currentYear;
      if (yearFilter === "next") return d.getFullYear() === currentYear + 1;
      return d.getFullYear() === currentYear || d.getFullYear() === currentYear + 1;
    });
  }, [filteredWeddings, yearFilter]);

  const weddingCount = filteredByYear.length;

  const upcomingCount = filteredByYear.filter(
    (w) => new Date(w.date) >= new Date()
  ).length;

  const upcomingSoonCount = filteredByYear.filter((w) => isUpcomingSoon(w.date)).length;

  const pendingPaymentCount = filteredByYear.filter((w) => hasPendingPayment(w)).length;

  const revenueTotal = weddings.reduce((acc, w) => {
    const value = parseInt(w.total.replace(/\D/g, "") || "0", 10);
    return acc + value;
  }, 0);

  const profitTotal = weddings.reduce((acc, w) => acc + calculateWeddingProfit(w), 0);

  const monthWeddings = filteredByYear.filter((w) =>
    isSameMonth(w.date, currentMonth)
  );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: Array<{ dayNumber: number | null; weddings: Wedding[] }> = [];

    for (let i = 0; i < startOffset; i++) {
      days.push({ dayNumber: null, weddings: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dayWeddings = filteredWeddings.filter((w) => {
        const d = new Date(w.date);
        return (
          d.getFullYear() === dayDate.getFullYear() &&
          d.getMonth() === dayDate.getMonth() &&
          d.getDate() === dayDate.getDate()
        );
      });
      days.push({ dayNumber: day, weddings: dayWeddings });
    }

    while (days.length % 7 !== 0) {
      days.push({ dayNumber: null, weddings: [] });
    }

    return days;
  }, [currentMonth, filteredWeddings]);

  const checklistDoneCount = selectedWedding
    ? checklistLabels.filter((item) => selectedWedding.checklist[item.key]).length
    : 0;

  const selectedWeddingPacks = selectedWedding
    ? getSelectedPacks(selectedWedding.package)
    : [];

  const selectedWeddingProfit = selectedWedding
    ? calculateWeddingProfit(selectedWedding)
    : 0;

  const selectedWeddingDaysUntil = selectedWedding
    ? getDaysUntilWedding(selectedWedding.date)
    : null;

  const selectedWeddingHasPendingPayment = selectedWedding
    ? hasPendingPayment(selectedWedding)
    : false;

  const selectedWeddingIsUpcomingSoon = selectedWedding
    ? isUpcomingSoon(selectedWedding.date)
    : false;

  const getUpdatedWeddingForm = (
    current: Omit<Wedding, "id">,
    key: keyof Omit<Wedding, "id">,
    value: string
  ) => {
    const next = { ...current, [key]: value };

    if (
      key === "total" ||
      key === "signal" ||
      key === "secondSignal" ||
      key === "thirdSignal"
    ) {
      next.balance = calculateBalance(
        next.total,
        next.signal,
        next.secondSignal,
        next.thirdSignal
      );
    }

    return next;
  };

  const updateForm = (key: keyof Omit<Wedding, "id">, value: string) => {
    setForm((prev) => getUpdatedWeddingForm(prev, key, value));
  };

  const updateEditForm = (
    key: keyof Omit<Wedding, "id">,
    value: string
  ) => {
    setEditForm((prev) => getUpdatedWeddingForm(prev, key, value));
  };

  const toggleAddPanel = () => {
    setIsAddPanelOpen((prev) => {
      const next = !prev;

      if (next) {
        setMobileSection("add");
      } else if (mobileSection === "add") {
        setMobileSection("agenda");
      }

      return next;
    });
  };

  const addWedding = () => {
    if (!form.couple || !form.date) return;

    const newWedding: Wedding = {
      ...form,
      balance: calculateBalance(
        form.total,
        form.signal,
        form.secondSignal,
        form.thirdSignal
      ),
      phone: form.bridePhone || form.groomPhone,
      email: form.brideEmail || form.groomEmail,
      venue: form.venueName || form.venue,
      checklist: { ...emptyChecklist },
      id: Date.now(),
    };

    const updated = [...weddings, newWedding];
    setWeddings(updated);
    setSelectedId(newWedding.id);
    setCurrentMonth(new Date(newWedding.date));
    setMobileSection("couple");
    setIsAddPanelOpen(false);
    setForm({ ...emptyForm, checklist: { ...emptyChecklist } });
  };

  const deleteWedding = (id: number) => {
    const weddingToDelete = weddings.find((w) => w.id === id);
    if (weddingToDelete) {
      setDeletedWedding(weddingToDelete);
    }
    const next = weddings.filter((w) => w.id !== id);
    setWeddings(next);
    setSelectedId(next[0]?.id ?? null);
    if (editingId === id) {
      setEditingId(null);
      setEditForm({ ...emptyForm, checklist: { ...emptyChecklist } });
    }
  };

  const undoDelete = () => {
    if (deletedWedding) {
      setWeddings([...weddings, deletedWedding]);
      setDeletedWedding(null);
    }
  };

  const startEditing = () => {
    if (!selectedWedding) return;
    setEditingId(selectedWedding.id);
    setEditForm({
      ...selectedWedding,
      venueName: selectedWedding.venueName || selectedWedding.venue,
      checklist: { ...selectedWedding.checklist },
    });
  };

  const saveEdit = () => {
    if (!selectedWedding || !editingId) return;

    const normalizedEdit = {
      ...editForm,
      balance: calculateBalance(
        editForm.total,
        editForm.signal,
        editForm.secondSignal,
        editForm.thirdSignal
      ),
      phone: editForm.bridePhone || editForm.groomPhone,
      email: editForm.brideEmail || editForm.groomEmail,
      venue: editForm.venueName || editForm.venue,
    };

    const updated = weddings.map((w) =>
      w.id === editingId ? { ...w, ...normalizedEdit } : w
    );

    setWeddings(updated);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ ...emptyForm, checklist: { ...emptyChecklist } });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const resetData = normalizeWeddings(defaultWeddings);
    setWeddings(resetData);
    setSelectedId(resetData[0]?.id ?? null);
    setEditingId(null);
    setForm({ ...emptyForm, checklist: { ...emptyChecklist } });
    setEditForm({ ...emptyForm, checklist: { ...emptyChecklist } });
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const toggleChecklistItem = (key: ChecklistKey) => {
    if (!selectedWedding) return;

    const updated = weddings.map((w) =>
      w.id === selectedWedding.id
        ? {
            ...w,
            checklist: {
              ...w.checklist,
              [key]: !w.checklist[key],
            },
          }
        : w
    );

    setWeddings(updated);
  };

  const importFromICal = (file: File, isAutoSync = false) => {
    setIsSyncing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsedEvents = parseICal(content);
        const newWeddings: Wedding[] = [];
        const updatedWeddings: Wedding[] = [];
        let importedCount = 0;
        let updatedCount = 0;

        const currentYear = new Date().getFullYear();
        const minDate = new Date(currentYear, 0, 1);
        const maxDate = new Date(currentYear + 1, 11, 31);

        parsedEvents
          .filter(event => {
            if (!event.date || !event.couple) return false;
            const eventDate = new Date(event.date);
            return eventDate >= minDate && eventDate <= maxDate;
          }) // Only import events with date and couple name within current and next year
          .forEach((event) => {
            // Check if wedding already exists (by couple name and date)
            const existingIndex = weddings.findIndex(w => 
              w.couple === event.couple && w.date === event.date
            );

            if (existingIndex >= 0) {
              // Update existing wedding with new info
              const existing = weddings[existingIndex];
              const updated = {
                ...existing,
                ...event,
                // Preserve existing data that's not in the calendar
                venue: event.venue || existing.venue,
                venueName: event.venueName || existing.venueName,
                notes: event.notes || existing.notes,
              };
              updatedWeddings.push(updated);
              updatedCount++;
            } else {
              // Create new wedding
              const newWedding: Wedding = {
                ...emptyForm,
                ...event,
                id: Date.now() + Math.random(), // Ensure unique IDs
                status: "Pendente" as WeddingStatus,
                phone: "",
                email: "",
                package: "",
                total: "",
                signal: "",
                secondSignal: "",
                thirdSignal: "",
                balance: "",
                delivery: "",
                teamCosts: "",
                laboratoryCosts: "",
                extraCosts: "",
                brideName: "",
                groomName: "",
                bridePhone: "",
                groomPhone: "",
                brideEmail: "",
                groomEmail: "",
                churchLocation: "",
                bridePrepLocation: "",
                groomPrepLocation: "",
                bridePrepTime: "",
                groomPrepTime: "",
                checklist: { ...emptyChecklist },
              };
              newWeddings.push(newWedding);
              importedCount++;
            }
          });

        if (newWeddings.length > 0 || updatedWeddings.length > 0) {
          let updatedWeddingsList = [...weddings];

          // Update existing weddings
          updatedWeddings.forEach(updated => {
            const index = updatedWeddingsList.findIndex(w => w.id === updated.id);
            if (index >= 0) {
              updatedWeddingsList[index] = updated;
            }
          });

          // Add new weddings
          updatedWeddingsList = [...updatedWeddingsList, ...newWeddings];

          // Cleanup old weddings: manter só ano atual e ano seguinte
          const currentYear = new Date().getFullYear();
          const minDate = new Date(currentYear, 0, 1);
          const maxDate = new Date(currentYear + 1, 11, 31);

          const finalWeddingsList = normalizeWeddings(updatedWeddingsList.filter((w) => {
            const d = new Date(w.date);
            return d >= minDate && d <= maxDate;
          }));

          setWeddings(finalWeddingsList);
          
          if (!isAutoSync) {
            setSelectedId(finalWeddingsList[0]?.id || null);
            if (finalWeddingsList[0]?.date) {
              setCurrentMonth(new Date(finalWeddingsList[0].date));
            }
          }

          setLastSync(new Date().toLocaleString('pt-PT'));
          
          const message = [];
          if (importedCount > 0) message.push(`${importedCount} casamento(s) importado(s)`);
          if (updatedCount > 0) message.push(`${updatedCount} casamento(s) atualizado(s)`);
          
          alert(`Sincronização concluída: ${message.join(', ')}!`);
        } else if (!isAutoSync) {
          alert("Nenhum casamento novo ou atualizado encontrado no arquivo .ics");
        }
      }
      setIsSyncing(false);
    };
    reader.readAsText(file);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1ea] text-[#7b6958]">
        A carregar...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea] p-4 text-[#3f3125] md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 text-center md:gap-4">
            <img
              src="/logo-fotografarte-preto.png"
              alt="Fotografarte Logo"
              className="h-24 w-auto shrink-0 object-contain md:h-32"
            />
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#3f3125]">
                FOTOGRAFARTE wedding planner
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-[#7b6958]">
                Organiza casais, contactos, locais, pagamentos, timeline do dia e entregas dos teus casamentos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:justify-center">
            <button
              onClick={refreshFromCloud}
              className="flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-[#f9f3eb] px-3 py-2 text-xs font-medium text-[#8c6a43] transition-colors hover:bg-[#efe4d6] md:text-sm"
              disabled={isCloudSyncing}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{isCloudSyncing ? "A atualizar..." : "Atualizar"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-[24px] border border-[#dbcbb7] bg-[#fffaf3] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#efe4d6] p-2.5 text-[#8c6a43]">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#7b6958] md:text-sm">Casamentos a caminho</p>
                <p className="text-xl font-bold text-[#3f3125] md:text-2xl">{upcomingCount}</p>
                <p className="text-[11px] text-[#a75d4d] md:text-xs">{upcomingSoonCount} nos próximos 30 dias</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dbcbb7] bg-[#fffaf3] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fcf2ef] p-2.5 text-[#a75d4d]">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#7b6958] md:text-sm">Pagamentos pendentes</p>
                <p className="text-xl font-bold text-[#a75d4d] md:text-2xl">{pendingPaymentCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dbcbb7] bg-[#fffaf3] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#efe4d6] p-2.5 text-[#8c6a43]">
                <Euro className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#7b6958] md:text-sm">Faturação prevista</p>
                <p className="hidden text-xl font-bold text-[#3f3125] md:block md:text-2xl">
                  {revenueTotal.toLocaleString("pt-PT")}€
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSummaryVisibility((prev) => ({
                      ...prev,
                      revenue: !prev.revenue,
                    }))
                  }
                  className="mt-1 text-left md:hidden"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8c6a43]">
                    {mobileSummaryVisibility.revenue ? "Ocultar valor" : "Ver valor"}
                  </span>
                  {mobileSummaryVisibility.revenue && (
                    <span className="mt-1 block text-xl font-bold text-[#3f3125]">
                      {revenueTotal.toLocaleString("pt-PT")}€
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dbcbb7] bg-[#fffaf3] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#eef0e7] p-2.5 text-[#5d6b43]">
                <Euro className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#7b6958] md:text-sm">Lucro Previsto</p>
                <p className={`hidden text-xl font-bold md:block md:text-2xl ${profitTotal >= 0 ? "text-[#5d6b43]" : "text-[#a75d4d]"}`}>
                  {profitTotal >= 0 ? "+" : ""}{profitTotal.toLocaleString("pt-PT")}€
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setMobileSummaryVisibility((prev) => ({
                      ...prev,
                      profit: !prev.profit,
                    }))
                  }
                  className="mt-1 text-left md:hidden"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5d6b43]">
                    {mobileSummaryVisibility.profit ? "Ocultar valor" : "Ver valor"}
                  </span>
                  {mobileSummaryVisibility.profit && (
                    <span className={`mt-1 block text-xl font-bold ${profitTotal >= 0 ? "text-[#5d6b43]" : "text-[#a75d4d]"}`}>
                      {profitTotal >= 0 ? "+" : ""}{profitTotal.toLocaleString("pt-PT")}€
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-[#3f3125]">
              Calendário Mensal
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-2xl border border-[#dbcbb7] bg-[#efe4d6] px-4 py-2 text-sm text-[#7b6958]"
              >
                ←
              </button>
              <div className="min-w-[180px] text-center text-sm font-medium capitalize text-[#7b6958]">
                {formatMonthYear(currentMonth)}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-2xl border border-[#dbcbb7] bg-[#efe4d6] px-4 py-2 text-sm text-[#7b6958]"
              >
                →
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#a08c79] md:hidden">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
              <div key={`${day}-${index}`} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:hidden">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (day.weddings[0]) {
                    setSelectedId(day.weddings[0].id);
                  }
                }}
                disabled={!day.dayNumber}
                className={`flex min-h-[48px] flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center transition ${
                  day.dayNumber
                    ? day.weddings.length > 0
                      ? "border-[#cdb79c] bg-[#efe4d6]"
                      : "border-[#dbcbb7] bg-[#f7efe5]"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day.dayNumber && (
                  <>
                    <span className="text-xs font-semibold text-[#3f3125]">
                      {day.dayNumber}
                    </span>
                    {day.weddings.length > 0 && (
                      <span className="mt-1 rounded-full bg-[#8c6a43] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {day.weddings.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2 md:hidden">
            {monthWeddings.length > 0 ? (
              monthWeddings.map((wedding) => {
                const weddingDaysUntil = getDaysUntilWedding(wedding.date);
                const weddingIsUpcomingSoon = isUpcomingSoon(wedding.date);
                const weddingHasPendingPayment = hasPendingPayment(wedding);

                return (
                  <button
                    key={wedding.id}
                    onClick={() => {
                      setSelectedId(wedding.id);
                      setMobileSection("couple");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#3f3125]">{wedding.couple}</div>
                      <div className="text-xs text-[#7b6958]">
                        {new Date(wedding.date).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "2-digit",
                        })} • {wedding.venueName || wedding.venue}
                      </div>
                      {(weddingIsUpcomingSoon || weddingHasPendingPayment) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {weddingIsUpcomingSoon && weddingDaysUntil !== null && (
                            <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-2 py-1 text-[10px] font-semibold text-[#a75d4d]">
                              {weddingDaysUntil === 0 ? "É hoje" : `${weddingDaysUntil} dias`}
                            </span>
                          )}
                          {weddingHasPendingPayment && (
                            <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-2 py-1 text-[10px] font-semibold text-[#a75d4d]">
                              Falta {wedding.balance}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${statusStyles[wedding.status]}`}>
                      {wedding.status}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] px-4 py-3 text-sm text-[#7b6958]">
                Sem casamentos marcados neste mês.
              </div>
            )}
          </div>

          <div className="mb-3 hidden grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-[#a08c79] md:grid">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="hidden grid-cols-7 gap-2 md:grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[110px] rounded-2xl border p-2 ${
                  day.dayNumber
                    ? "border-[#dbcbb7] bg-[#f7efe5]"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day.dayNumber && (
                  <>
                    <div className="mb-2 text-sm font-semibold text-[#7b6958]">
                      {day.dayNumber}
                    </div>
                    <div className="space-y-1">
                      {day.weddings.slice(0, 2).map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedId(w.id)}
                          className="block w-full rounded-xl bg-[#efe4d6] px-2 py-1 text-left text-[11px] text-[#3f3125]"
                        >
                          {w.couple}
                        </button>
                      ))}
                      {day.weddings.length > 2 && (
                        <div className="text-[11px] text-[#8c6a43]">
                          +{day.weddings.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] p-4 text-sm text-[#7b6958]">
            <span className="font-semibold">Neste mês:</span> {monthWeddings.length} casamento(s)
          </div>
        </div>

        <div className="sticky top-2 z-20 grid grid-cols-3 gap-2 rounded-[24px] border border-[#dbcbb7] bg-[#f6f1ea]/95 p-2 shadow-sm backdrop-blur xl:hidden">
          <button
            onClick={() => setMobileSection("agenda")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              mobileSection === "agenda"
                ? "bg-[#8c6a43] text-white shadow-sm"
                : "border border-[#dbcbb7] bg-[#fffaf3] text-[#7b6958]"
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setMobileSection("couple")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              mobileSection === "couple"
                ? "bg-[#8c6a43] text-white shadow-sm"
                : "border border-[#dbcbb7] bg-[#fffaf3] text-[#7b6958]"
            }`}
          >
            Casal
          </button>
          <button
            onClick={toggleAddPanel}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              mobileSection === "add" && isAddPanelOpen
                ? "bg-[#8c6a43] text-white shadow-sm"
                : "border border-[#dbcbb7] bg-[#fffaf3] text-[#7b6958]"
            }`}
          >
            {isAddPanelOpen ? "Fechar" : "Adicionar"}
          </button>
        </div>

        <div className="sticky top-3 z-20 hidden xl:flex justify-end">
          <button
            onClick={toggleAddPanel}
            className="flex items-center rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-4 py-3 text-sm font-medium text-[#7b6958] shadow-sm transition hover:bg-[#f7efe5]"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAddPanelOpen ? "Fechar adicionar casamento" : "Adicionar casamento"}
          </button>
        </div>

        <div className={`grid gap-6 ${isAddPanelOpen ? "xl:grid-cols-[1fr_1.45fr_0.95fr]" : "xl:grid-cols-[1fr_1.55fr]"}`}>
          <div className={`${mobileSection === "agenda" ? "block" : "hidden"} rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm xl:block`}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-[#3f3125]">
                  Agenda de Casamentos
                </h2>
                {deletedWedding && (
                  <button
                    onClick={undoDelete}
                    className="flex items-center rounded-2xl bg-[#8c6a43] px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Desfazer
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:w-[260px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c6a43]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar casal, quinta, igreja..."
                    className="h-11 w-full rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] pl-9 pr-3 text-[#3f3125] outline-none focus:border-[#8c6a43]"
                  />
                </div>
                <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 text-xs text-[#3f3125] md:w-[260px]">
                  <span>Ano:</span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value as any)}
                    className="h-full flex-1 rounded-md border border-[#dbcbb7] bg-[#fffaf3] px-2 text-xs"
                  >
                    <option value="currentNext">Atual + Seguinte</option>
                    <option value="current">Atual</option>
                    <option value="next">Seguinte</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredByYear.map((wedding) => {
                const weddingDaysUntil = getDaysUntilWedding(wedding.date);
                const weddingIsUpcomingSoon = isUpcomingSoon(wedding.date);
                const weddingHasPendingPayment = hasPendingPayment(wedding);

                return (
                  <button
                    key={wedding.id}
                    onClick={() => {
                      setSelectedId(wedding.id);
                      setMobileSection("couple");
                      setEditingId(null);
                      setCurrentMonth(new Date(wedding.date));
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                      wedding.checklist.weddingDone
                        ? "border-[#d9ddcf] bg-[#eef0e7]"
                        : selectedId === wedding.id
                        ? "border-[#8c6a43] bg-[#f7efe5]"
                        : "border-[#dbcbb7] bg-[#fffaf3]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[#3f3125]">
                          {wedding.couple}
                        </p>
                        <p className="mt-1 text-sm text-[#7b6958]">
                          {wedding.date} • {wedding.venueName || wedding.venue}
                        </p>
                        <p className="mt-1 text-sm text-[#7b6958]">
                          {wedding.brideName} / {wedding.groomName}
                        </p>
                        {(weddingIsUpcomingSoon || weddingHasPendingPayment) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {weddingIsUpcomingSoon && weddingDaysUntil !== null && (
                              <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-3 py-1 text-xs font-semibold text-[#a75d4d]">
                                {weddingDaysUntil === 0 ? "Casamento hoje" : `Faltam ${weddingDaysUntil} dias`}
                              </span>
                            )}
                            {weddingHasPendingPayment && (
                              <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-3 py-1 text-xs font-semibold text-[#a75d4d]">
                                Falta receber {wedding.balance}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {wedding.checklist.weddingDone && (
                          <span className="rounded-full border border-[#d9ddcf] bg-[#eef0e7] px-3 py-1 text-xs font-medium text-[#5d6b43]">
                            Casamento efetuado
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            statusStyles[wedding.status]
                          }`}
                        >
                          {wedding.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${mobileSection === "couple" ? "block space-y-4" : "hidden"} xl:block xl:space-y-6`}>
            <div className="rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#3f3125]">
                  Painel do Casal
                </h2>

                {selectedWedding && editingId !== selectedWedding.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEditing}
                      className="flex items-center rounded-2xl bg-[#efe4d6] px-4 py-2 text-sm text-[#7b6958] transition hover:opacity-90"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteWedding(selectedWedding.id)}
                      className="flex items-center rounded-2xl bg-[#a75d4d] px-2.5 py-2 text-xs text-white transition hover:opacity-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {selectedWedding ? (
                editingId === selectedWedding.id ? (
                  <div className="space-y-4">
                    <div>
                      <SectionTitle icon={<Users className="h-4 w-4" />} title="Noivos" />
                      <div className="space-y-2">
                        <InputField
                          placeholder="Nome do casal"
                          value={editForm.couple}
                          onChange={(value) => updateEditForm("couple", value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <InputField
                            placeholder="Nome da noiva"
                            value={editForm.brideName}
                            onChange={(value) => updateEditForm("brideName", value)}
                          />
                          <InputField
                            placeholder="Nome do noivo"
                            value={editForm.groomName}
                            onChange={(value) => updateEditForm("groomName", value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <InputField
                            placeholder="Contacto da noiva"
                            value={editForm.bridePhone}
                            onChange={(value) => updateEditForm("bridePhone", value)}
                          />
                          <InputField
                            placeholder="Contacto do noivo"
                            value={editForm.groomPhone}
                            onChange={(value) => updateEditForm("groomPhone", value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <InputField
                            placeholder="Email da noiva"
                            value={editForm.brideEmail}
                            onChange={(value) => updateEditForm("brideEmail", value)}
                          />
                          <InputField
                            placeholder="Email do noivo"
                            value={editForm.groomEmail}
                            onChange={(value) => updateEditForm("groomEmail", value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={<Church className="h-4 w-4" />} title="Locais" />
                      <div className="space-y-2">
                        <InputField
                          placeholder="Nome da quinta"
                          value={editForm.venueName}
                          onChange={(value) => updateEditForm("venueName", value)}
                        />
                        <InputField
                          placeholder="Local da igreja"
                          value={editForm.churchLocation}
                          onChange={(value) => updateEditForm("churchLocation", value)}
                        />
                        <InputField
                          placeholder="Preparação da noiva"
                          value={editForm.bridePrepLocation}
                          onChange={(value) => updateEditForm("bridePrepLocation", value)}
                        />
                        <InputField
                          placeholder="Preparação do noivo"
                          value={editForm.groomPrepLocation}
                          onChange={(value) => updateEditForm("groomPrepLocation", value)}
                        />
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={<Home className="h-4 w-4" />} title="Detalhes" />
                      <div className="space-y-2">
                        <DateInputField
                          value={editForm.date}
                          onChange={(value) => updateEditForm("date", value)}
                        />
                        <div className="relative">
                          <select
                            value={editForm.status}
                            onChange={(e) => updateEditForm("status", e.target.value as WeddingStatus)}
                            className="w-full appearance-none rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-[#3f3125] outline-none focus:border-[#8c6a43]"
                          >
                            <option>Pendente</option>
                            <option>Confirmado</option>
                            <option>Editado</option>
                            <option>Entregue</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c6a43]" />
                        </div>
                        <PackageSelector
                          value={editForm.package}
                          onChange={(value) => updateEditForm("package", value)}
                        />
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                          <FinanceInputCard
                            label="Total serviço"
                            value={editForm.total}
                            onChange={(value) => updateEditForm("total", value)}
                          />
                          <FinanceInputCard
                            label="1 sinal"
                            value={editForm.signal}
                            onChange={(value) => updateEditForm("signal", value)}
                          />
                          <FinanceInputCard
                            label="2 sinal"
                            value={editForm.secondSignal}
                            onChange={(value) => updateEditForm("secondSignal", value)}
                          />
                          <FinanceInputCard
                            label="3 sinal"
                            value={editForm.thirdSignal}
                            onChange={(value) => updateEditForm("thirdSignal", value)}
                          />
                          <FinanceInputCard
                            label="Freelancers"
                            value={editForm.teamCosts}
                            onChange={(value) => updateEditForm("teamCosts", value)}
                          />
                          <FinanceInputCard
                            label="Laboratorio"
                            value={editForm.laboratoryCosts}
                            onChange={(value) => updateEditForm("laboratoryCosts", value)}
                          />
                          <FinanceInputCard
                            label="Extras"
                            value={editForm.extraCosts}
                            onChange={(value) => updateEditForm("extraCosts", value)}
                          />
                          <FinanceInputCard
                            label="Falta pagar"
                            value={editForm.balance}
                            onChange={() => {}}
                            readOnly
                          />
                        </div>
                        <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Preparação do Noivo</label>
                            <InputField
                              type="time"
                              placeholder="HH:MM"
                              value={editForm.groomPrepTime}
                              onChange={(value) => updateEditForm("groomPrepTime", value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Preparação da Noiva</label>
                            <InputField
                              type="time"
                              placeholder="HH:MM"
                              value={editForm.bridePrepTime}
                              onChange={(value) => updateEditForm("bridePrepTime", value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Cerimónia</label>
                            <InputField
                              type="time"
                              placeholder="HH:MM"
                              value={editForm.ceremony}
                              onChange={(value) => updateEditForm("ceremony", value)}
                            />
                          </div>
                        </div>
                        <SectionTitle icon={<Home className="h-4 w-4" />} title="Entrega" />
                        <InputField
                          placeholder="Tipo de entrega"
                          value={editForm.delivery}
                          onChange={(value) => updateEditForm("delivery", value)}
                        />
                        <textarea
                          placeholder="Notas"
                          value={editForm.notes}
                          onChange={(e) => updateEditForm("notes", e.target.value)}
                          className="min-h-[120px] w-full rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-[#3f3125] outline-none transition focus:border-[#8c6a43]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={saveEdit}
                        className="flex items-center rounded-2xl bg-[#8c6a43] px-4 py-3 text-white transition hover:opacity-90"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar alterações
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="flex items-center rounded-2xl bg-[#efe4d6] px-4 py-3 text-[#7b6958] transition hover:opacity-90"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-bold text-[#3f3125]">
                          {selectedWedding.couple}
                        </h3>
                        <p className="mt-1 text-sm text-[#7b6958]">
                          {selectedWedding.date}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          statusStyles[selectedWedding.status]
                        }`}
                      >
                        {selectedWedding.status}
                      </span>
                    </div>

                    {(selectedWeddingIsUpcomingSoon || selectedWeddingHasPendingPayment) && (
                      <div className="flex flex-wrap gap-2">
                        {selectedWeddingIsUpcomingSoon && selectedWeddingDaysUntil !== null && (
                          <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-3 py-1 text-xs font-semibold text-[#a75d4d]">
                            {selectedWeddingDaysUntil === 0
                              ? "Casamento hoje"
                              : `Faltam ${selectedWeddingDaysUntil} dias para o casamento`}
                          </span>
                        )}
                        {selectedWeddingHasPendingPayment && (
                          <span className="rounded-full border border-[#ead3cc] bg-[#fcf2ef] px-3 py-1 text-xs font-semibold text-[#a75d4d]">
                            Pagamento pendente: {selectedWedding.balance}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <SectionTitle icon={<Users className="h-4 w-4" />} title="Contactos dos noivos" />
                      <div className="space-y-3 text-sm text-[#3f3125]">
                        <div>
                          <div className="font-medium text-[#3f3125]">Noiva: {selectedWedding.brideName || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedWedding.bridePhone || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4" /> {selectedWedding.brideEmail || "—"}</div>
                        </div>
                        <div>
                          <div className="font-medium text-[#3f3125]">Noivo: {selectedWedding.groomName || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedWedding.groomPhone || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4" /> {selectedWedding.groomEmail || "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <SectionTitle icon={<Church className="h-4 w-4" />} title="Locais do casamento" />
                      <div className="space-y-2 text-sm text-[#3f3125]">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Quinta: {selectedWedding.venueName || "—"}</div>
                        <div className="flex items-center gap-2"><Church className="h-4 w-4" /> Igreja: {selectedWedding.churchLocation || "—"}</div>
                        <div className="flex items-center gap-2"><Home className="h-4 w-4" /> Preparação noiva: {selectedWedding.bridePrepLocation || "—"}</div>
                        <div className="flex items-center gap-2"><Home className="h-4 w-4" /> Preparação noivo: {selectedWedding.groomPrepLocation || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                      <div className="space-y-2 text-sm text-[#3f3125]">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Prep. noivo: {selectedWedding.groomPrepTime || "—"}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Prep. noiva: {selectedWedding.bridePrepTime || "—"}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Cerimónia: {selectedWedding.ceremony || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <SectionTitle icon={<Camera className="h-4 w-4" />} title="Serviço" />
                      <div className="space-y-2 text-sm text-[#3f3125]">
                        <div className="flex items-start gap-2">
                          <Camera className="mt-0.5 h-4 w-4" />
                          <div>
                            <div>Pack contratado</div>
                            {selectedWeddingPacks.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedWeddingPacks.map((pack) => (
                                  <span
                                    key={pack}
                                    className="rounded-full border border-[#cdb79c] bg-[#fffaf3] px-3 py-1 text-xs font-semibold text-[#7f6548]"
                                  >
                                    {pack}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-[#7b6958]">{selectedWedding.package || "—"}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Tipo de entrega: {selectedWedding.delivery || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <SectionTitle icon={<Euro className="h-4 w-4" />} title="Financeiro" />
                      {selectedWeddingHasPendingPayment && (
                        <div className="mb-3 rounded-2xl border border-[#ead3cc] bg-[#fcf2ef] px-3 py-2 text-xs font-semibold text-[#a75d4d]">
                          Ainda falta receber {selectedWedding.balance} deste casamento.
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        <FinanceSummaryCard label="Total serviço" value={selectedWedding.total} />
                        <FinanceSummaryCard label="1 sinal" value={selectedWedding.signal} />
                        <FinanceSummaryCard label="2 sinal" value={selectedWedding.secondSignal} />
                        <FinanceSummaryCard label="3 sinal" value={selectedWedding.thirdSignal} />
                        <FinanceSummaryCard label="Freelancers" value={selectedWedding.teamCosts} />
                        <FinanceSummaryCard label="Laboratorio" value={selectedWedding.laboratoryCosts} />
                        <FinanceSummaryCard label="Extras" value={selectedWedding.extraCosts} />
                        <FinanceSummaryCard
                          label="Falta pagar"
                          value={selectedWedding.balance}
                          className={selectedWeddingHasPendingPayment ? "border-[#ead3cc] bg-[#fcf2ef]" : ""}
                          valueClassName={selectedWeddingHasPendingPayment ? "text-[#a75d4d]" : ""}
                        />
                        <FinanceSummaryCard
                          label="Lucro real"
                          value={formatMoneyValue(selectedWeddingProfit)}
                          className={selectedWeddingProfit >= 0 ? "border-[#d9ddcf] bg-[#eef0e7]" : "border-[#ead3cc] bg-[#fcf2ef]"}
                          valueClassName={selectedWeddingProfit >= 0 ? "text-[#5d6b43]" : "text-[#a75d4d]"}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f7efe5] p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#7b6958]">
                        <FileText className="h-4 w-4" />
                        Notas
                      </div>
                      <p className="text-sm leading-6 text-[#5e4a3a]">
                        {selectedWedding.notes || "Sem notas."}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-[#7b6958]">Seleciona um casamento.</p>
              )}
            </div>

            <div className="rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#3f3125]">
                  Checklist do Casal
                </h2>
                <div className="rounded-2xl bg-[#efe4d6] px-3 py-2 text-sm text-[#7b6958]">
                  {checklistDoneCount}/{checklistLabels.length}
                </div>
              </div>

              {selectedWedding ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {checklistLabels.map((item) => {
                    const checked = selectedWedding.checklist[item.key];
                    return (
                      <button
                        key={item.key}
                        onClick={() => toggleChecklistItem(item.key)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          checked
                            ? "border-[#cdb79c] bg-[#efe4d6] text-[#3f3125]"
                            : "border-[#dbcbb7] bg-[#f7efe5] text-[#7b6958]"
                        }`}
                      >
                        <CheckSquare
                          className={`h-5 w-5 ${
                            checked ? "text-[#8c6a43]" : "text-[#cdb79c]"
                          }`}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#7b6958]">Seleciona um casamento para ver a checklist.</p>
              )}
            </div>
          </div>

          <div className={`${mobileSection === "add" && isAddPanelOpen ? "block" : "hidden"} rounded-[28px] border border-[#dbcbb7] bg-[#fffaf3] p-6 shadow-sm ${isAddPanelOpen ? "xl:block" : "xl:hidden"}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#3f3125]">
                Adicionar Casamento
              </h2>
              <button
                onClick={toggleAddPanel}
                className="rounded-2xl border border-[#dbcbb7] bg-[#f7efe5] px-3 py-2 text-sm text-[#7b6958] transition hover:opacity-90"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <SectionTitle icon={<Users className="h-4 w-4" />} title="Noivos" />
                <div className="space-y-2">
                  <InputField
                    placeholder="Nome do casal"
                    value={form.couple}
                    onChange={(value) => updateForm("couple", value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      placeholder="Nome da noiva"
                      value={form.brideName}
                      onChange={(value) => updateForm("brideName", value)}
                    />
                    <InputField
                      placeholder="Nome do noivo"
                      value={form.groomName}
                      onChange={(value) => updateForm("groomName", value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      placeholder="Contacto da noiva"
                      value={form.bridePhone}
                      onChange={(value) => updateForm("bridePhone", value)}
                    />
                    <InputField
                      placeholder="Contacto do noivo"
                      value={form.groomPhone}
                      onChange={(value) => updateForm("groomPhone", value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      placeholder="Email da noiva"
                      value={form.brideEmail}
                      onChange={(value) => updateForm("brideEmail", value)}
                    />
                    <InputField
                      placeholder="Email do noivo"
                      value={form.groomEmail}
                      onChange={(value) => updateForm("groomEmail", value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle icon={<Church className="h-4 w-4" />} title="Locais" />
                <div className="space-y-2">
                  <InputField
                    placeholder="Nome da quinta"
                    value={form.venueName}
                    onChange={(value) => updateForm("venueName", value)}
                  />
                  <InputField
                    placeholder="Local da igreja"
                    value={form.churchLocation}
                    onChange={(value) => updateForm("churchLocation", value)}
                  />
                  <InputField
                    placeholder="Preparação da noiva"
                    value={form.bridePrepLocation}
                    onChange={(value) => updateForm("bridePrepLocation", value)}
                  />
                  <InputField
                    placeholder="Preparação do noivo"
                    value={form.groomPrepLocation}
                    onChange={(value) => updateForm("groomPrepLocation", value)}
                  />
                </div>
              </div>

              <div>
                <SectionTitle icon={<Home className="h-4 w-4" />} title="Detalhes do serviço" />
                <div className="space-y-2">
                  <DateInputField
                    value={form.date}
                    onChange={(value) => updateForm("date", value)}
                  />
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value as WeddingStatus)}
                      className="w-full appearance-none rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-[#3f3125] outline-none focus:border-[#8c6a43]"
                    >
                      <option>Pendente</option>
                      <option>Confirmado</option>
                      <option>Editado</option>
                      <option>Entregue</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c6a43]" />
                  </div>
                  <PackageSelector
                    value={form.package}
                    onChange={(value) => updateForm("package", value)}
                  />
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <FinanceInputCard
                      label="Total serviço"
                      value={form.total}
                      onChange={(value) => updateForm("total", value)}
                    />
                    <FinanceInputCard
                      label="1 sinal"
                      value={form.signal}
                      onChange={(value) => updateForm("signal", value)}
                    />
                    <FinanceInputCard
                      label="2 sinal"
                      value={form.secondSignal}
                      onChange={(value) => updateForm("secondSignal", value)}
                    />
                    <FinanceInputCard
                      label="3 sinal"
                      value={form.thirdSignal}
                      onChange={(value) => updateForm("thirdSignal", value)}
                    />
                    <FinanceInputCard
                      label="Freelancers"
                      value={form.teamCosts}
                      onChange={(value) => updateForm("teamCosts", value)}
                    />
                    <FinanceInputCard
                      label="Laboratorio"
                      value={form.laboratoryCosts}
                      onChange={(value) => updateForm("laboratoryCosts", value)}
                    />
                    <FinanceInputCard
                      label="Extras"
                      value={form.extraCosts}
                      onChange={(value) => updateForm("extraCosts", value)}
                    />
                    <FinanceInputCard
                      label="Falta pagar"
                      value={form.balance}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                  <div>
                    <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Preparação do Noivo</label>
                        <InputField
                          type="time"
                          placeholder="HH:MM"
                          value={form.groomPrepTime}
                          onChange={(value) => updateForm("groomPrepTime", value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Preparação da Noiva</label>
                        <InputField
                          type="time"
                          placeholder="HH:MM"
                          value={form.bridePrepTime}
                          onChange={(value) => updateForm("bridePrepTime", value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#7b6958]">Cerimónia</label>
                        <InputField
                          type="time"
                          placeholder="HH:MM"
                          value={form.ceremony}
                          onChange={(value) => updateForm("ceremony", value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <SectionTitle icon={<Home className="h-4 w-4" />} title="Entrega" />
                    <div className="space-y-2">
                      <InputField
                        placeholder="Tipo de entrega"
                        value={form.delivery}
                        onChange={(value) => updateForm("delivery", value)}
                          />
                    </div>
                  </div>
                  <div>
                    <textarea
                      placeholder="Notas importantes"
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl border border-[#dbcbb7] bg-[#fffaf3] px-3 py-2.5 text-[#3f3125] outline-none transition focus:border-[#8c6a43]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addWedding}
                className="flex w-full items-center justify-center rounded-2xl bg-[#8c6a43] px-4 py-3 text-white transition hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar casamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
