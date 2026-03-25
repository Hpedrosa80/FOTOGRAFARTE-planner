"use client";

import React, { useEffect, useMemo, useState } from "react";
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
    balance: "1750€",
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
  Pendente: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  Confirmado: "bg-[#dcfce7] text-[#16a34a] border-[#a7f3d0]",
  Editado: "bg-[#ede9fe] text-[#6d28d9] border-[#c4b5fd]",
  Entregue: "bg-[#dbeafe] text-[#4b7abf] border-[#93c5fd]",
};

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2.5 text-[#1e3a5f] outline-none transition focus:border-[#2563eb]"
    />
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
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#4b7abf]">
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
  const [yearFilter, setYearFilter] = useState<"all" | "current" | "next" | "currentNext">("currentNext");
  const [currentMonth, setCurrentMonth] = useState(() => {    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: Wedding[] = JSON.parse(saved).map((w: Wedding) => ({
        ...w,
        checklist: { ...emptyChecklist, ...(w.checklist || {}) },
      }));
      setWeddings(parsed);
      setSelectedId(parsed[0]?.id ?? null);
    } else {
      setWeddings(defaultWeddings);
      setSelectedId(defaultWeddings[0]?.id ?? null);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weddings));
  }, [weddings, isLoaded]);

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

  const confirmedCount = filteredByYear.filter(
    (w) => w.status === "Confirmado"
  ).length;

  const revenueTotal = weddings.reduce((acc, w) => {
    const value = parseInt(w.total.replace(/\D/g, "") || "0", 10);
    return acc + value;
  }, 0);

  const profitTotal = weddings.reduce((acc, w) => {
    const revenue = parseInt(w.total.replace(/\D/g, "") || "0", 10);
    const teamCost = parseInt((w.teamCosts || "").replace(/\D/g, "") || "0", 10);
    const labCost = parseInt((w.laboratoryCosts || "").replace(/\D/g, "") || "0", 10);
    const extraCost = parseInt((w.extraCosts || "").replace(/\D/g, "") || "0", 10);
    return acc + (revenue - teamCost - labCost - extraCost);
  }, 0);

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

  const updateForm = (key: keyof Omit<Wedding, "id">, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditForm = (
    key: keyof Omit<Wedding, "id">,
    value: string
  ) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const addWedding = () => {
    if (!form.couple || !form.date) return;

    const newWedding: Wedding = {
      ...form,
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
    setWeddings(defaultWeddings);
    setSelectedId(defaultWeddings[0]?.id ?? null);
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

          const finalWeddingsList = updatedWeddingsList.filter((w) => {
            const d = new Date(w.date);
            return d >= minDate && d <= maxDate;
          });

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
      <div className="flex min-h-screen items-center justify-center bg-[#f0f5ff] text-[#4b7abf]">
        A carregar...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff] p-4 text-[#1e3a5f] md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo-fotografarte.png" 
              alt="Fotografarte Logo" 
              className="h-40 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e3a5f]">
                FOTOGRAFARTE Wedding Planner
              </h1>
              <p className="mt-1 text-sm text-[#4b7abf]">
                Organiza casais, contactos, locais, pagamentos, timeline do dia e entregas dos teus casamentos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-2 rounded-2xl border border-[#bfdbfe] px-4 py-3 text-sm text-[#4b7abf] transition-colors cursor-pointer ${
                isSyncing ? 'bg-[#dbeafe] opacity-50' : 'bg-[#dbeafe] hover:bg-[#bfdbfe]'
              }`}>
                <Calendar className="h-4 w-4" />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Google Calendar'}</span>
                <input
                  type="file"
                  accept=".ics"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !isSyncing) {
                      importFromICal(file);
                    }
                    // Reset input
                    e.target.value = '';
                  }}
                  className="hidden"
                  disabled={isSyncing}
                />
              </label>
              <div className="text-xs text-[#6b9fd4] max-w-xs">
                1. Acesse calendar.google.com
                <br />
                2. Configurações → Importar/Exportar
                <br />
                3. Exporte como .ics e importe aqui
              </div>
            </div>
            <button
              onClick={() => {
                const icalContent = generateICalContent(weddings);
                downloadICalFile(icalContent, 'fotografarte-casamentos.ics');
              }}
              className="flex items-center gap-2 rounded-2xl border border-[#bfdbfe] bg-[#dbeafe] px-4 py-3 text-sm text-[#4b7abf] hover:bg-[#bfdbfe] transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Exportar para Google Calendar</span>
            </button>
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-[#bfdbfe] bg-[#dbeafe] px-4 py-3 text-sm text-[#4b7abf]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{weddings.length} eventos registados</span>
              </div>
              {lastSync && (
                <div className="text-xs text-[#6b9fd4]">
                  Última sync: {lastSync}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#dbeafe] p-3 text-[#2563eb]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#4b7abf]">Casamentos a caminho</p>
                <p className="text-2xl font-bold text-[#1e3a5f]">{upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#dbeafe] p-3 text-[#2563eb]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#4b7abf]">Fechados</p>
                <p className="text-2xl font-bold text-[#1e3a5f]">{confirmedCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#dbeafe] p-3 text-[#2563eb]">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#4b7abf]">Faturação prevista</p>
                <p className="text-2xl font-bold text-[#1e3a5f]">
                  {revenueTotal.toLocaleString("pt-PT")}€
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#dcfce7] p-3 text-[#16a34a]">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[#4b7abf]">Lucro Previsto</p>
                <p className={`text-2xl font-bold ${profitTotal >= 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
                  {profitTotal >= 0 ? "+" : ""}{profitTotal.toLocaleString("pt-PT")}€
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-[#1e3a5f]">
              Calendário Mensal
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-2xl border border-[#bfdbfe] bg-[#dbeafe] px-4 py-2 text-sm text-[#4b7abf]"
              >
                ←
              </button>
              <div className="min-w-[180px] text-center text-sm font-medium capitalize text-[#4b7abf]">
                {formatMonthYear(currentMonth)}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-2xl border border-[#bfdbfe] bg-[#dbeafe] px-4 py-2 text-sm text-[#4b7abf]"
              >
                →
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-[#6b9fd4]">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[110px] rounded-2xl border p-2 ${
                  day.dayNumber
                    ? "border-[#bfdbfe] bg-[#eef3fb]"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day.dayNumber && (
                  <>
                    <div className="mb-2 text-sm font-semibold text-[#4b7abf]">
                      {day.dayNumber}
                    </div>
                    <div className="space-y-1">
                      {day.weddings.slice(0, 2).map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedId(w.id)}
                          className="block w-full rounded-xl bg-[#dbeafe] px-2 py-1 text-left text-[11px] text-[#1e3a5f]"
                        >
                          {w.couple}
                        </button>
                      ))}
                      {day.weddings.length > 2 && (
                        <div className="text-[11px] text-[#2563eb]">
                          +{day.weddings.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-[#eef3fb] p-4 text-sm text-[#4b7abf]">
            <span className="font-semibold">Neste mês:</span> {monthWeddings.length} casamento(s)
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr_1.2fr]">
          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-[#1e3a5f]">
                  Agenda de Casamentos
                </h2>
                {deletedWedding && (
                  <button
                    onClick={undoDelete}
                    className="flex items-center rounded-2xl bg-[#2563eb] px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Desfazer
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563eb]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar casal, quinta, igreja..."
                    className="w-full rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] py-2 pl-9 pr-3 text-[#1e3a5f] outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2 text-xs text-[#1e3a5f]">
                  <span>Ano:</span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value as any)}
                    className="rounded-md border border-[#bfdbfe] bg-[#f5f9ff] px-2 py-1 text-xs"
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
              {filteredByYear.map((wedding) => (
                <button
                  key={wedding.id}
                  onClick={() => {
                    setSelectedId(wedding.id);
                    setEditingId(null);
                    setCurrentMonth(new Date(wedding.date));
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                    wedding.checklist.weddingDone
                      ? "border-[#a7f3d0] bg-[#dcfce7]"
                      : selectedId === wedding.id
                      ? "border-[#2563eb] bg-[#eef3fb]"
                      : "border-[#bfdbfe] bg-[#f5f9ff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[#1e3a5f]">
                        {wedding.couple}
                      </p>
                      <p className="mt-1 text-sm text-[#4b7abf]">
                        {wedding.date} • {wedding.venueName || wedding.venue}
                      </p>
                      <p className="mt-1 text-sm text-[#4b7abf]">
                        {wedding.brideName} / {wedding.groomName}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {wedding.checklist.weddingDone && (
                        <span className="rounded-full border border-[#a7f3d0] bg-[#dcfce7] px-3 py-1 text-xs font-medium text-[#16a34a]">
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
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#1e3a5f]">
                  Painel do Casal
                </h2>

                {selectedWedding && editingId !== selectedWedding.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEditing}
                      className="flex items-center rounded-2xl bg-[#dbeafe] px-4 py-2 text-sm text-[#4b7abf] transition hover:opacity-90"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteWedding(selectedWedding.id)}
                      className="flex items-center rounded-2xl bg-[#ef4444] px-2.5 py-2 text-xs text-white transition hover:opacity-90"
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
                        <InputField
                          type="date"
                          placeholder="Data"
                          value={editForm.date}
                          onChange={(value) => updateEditForm("date", value)}
                        />
                        <div className="relative">
                          <select
                            value={editForm.status}
                            onChange={(e) => updateEditForm("status", e.target.value as WeddingStatus)}
                            className="w-full appearance-none rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2.5 text-[#1e3a5f] outline-none focus:border-[#2563eb]"
                          >
                            <option>Pendente</option>
                            <option>Confirmado</option>
                            <option>Editado</option>
                            <option>Entregue</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563eb]" />
                        </div>
                        <InputField
                          placeholder="Pack contratado"
                          value={editForm.package}
                          onChange={(value) => updateEditForm("package", value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <InputField
                            placeholder="Total"
                            value={editForm.total}
                            onChange={(value) => updateEditForm("total", value)}
                          />
                          <InputField
                            placeholder="Sinal"
                            value={editForm.signal}
                            onChange={(value) => updateEditForm("signal", value)}
                          />
                          <InputField
                            placeholder="Falta pagar"
                            value={editForm.balance}
                            onChange={(value) => updateEditForm("balance", value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <InputField
                            placeholder="Custos da equipa"
                            value={editForm.teamCosts}
                            onChange={(value) => updateEditForm("teamCosts", value)}
                          />
                          <InputField
                            placeholder="Custos laboratorio"
                            value={editForm.laboratoryCosts}
                            onChange={(value) => updateEditForm("laboratoryCosts", value)}
                          />
                          <InputField
                            placeholder="Custos extras"
                            value={editForm.extraCosts}
                            onChange={(value) => updateEditForm("extraCosts", value)}
                          />
                        </div>
                        <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Preparação do Noivo</label>
                            <InputField
                              type="time"
                              placeholder="HH:MM"
                              value={editForm.groomPrepTime}
                              onChange={(value) => updateEditForm("groomPrepTime", value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Preparação da Noiva</label>
                            <InputField
                              type="time"
                              placeholder="HH:MM"
                              value={editForm.bridePrepTime}
                              onChange={(value) => updateEditForm("bridePrepTime", value)}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Cerimónia</label>
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
                          className="min-h-[120px] w-full rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2.5 text-[#1e3a5f] outline-none transition focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={saveEdit}
                        className="flex items-center rounded-2xl bg-[#2563eb] px-4 py-3 text-white transition hover:opacity-90"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar alterações
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="flex items-center rounded-2xl bg-[#dbeafe] px-4 py-3 text-[#4b7abf] transition hover:opacity-90"
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
                        <h3 className="text-2xl font-bold text-[#1e3a5f]">
                          {selectedWedding.couple}
                        </h3>
                        <p className="mt-1 text-sm text-[#4b7abf]">
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

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Users className="h-4 w-4" />} title="Contactos dos noivos" />
                      <div className="space-y-3 text-sm text-[#1e3a5f]">
                        <div>
                          <div className="font-medium text-[#1e3a5f]">Noiva: {selectedWedding.brideName || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedWedding.bridePhone || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4" /> {selectedWedding.brideEmail || "—"}</div>
                        </div>
                        <div>
                          <div className="font-medium text-[#1e3a5f]">Noivo: {selectedWedding.groomName || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedWedding.groomPhone || "—"}</div>
                          <div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4" /> {selectedWedding.groomEmail || "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Church className="h-4 w-4" />} title="Locais do casamento" />
                      <div className="space-y-2 text-sm text-[#1e3a5f]">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Quinta: {selectedWedding.venueName || "—"}</div>
                        <div className="flex items-center gap-2"><Church className="h-4 w-4" /> Igreja: {selectedWedding.churchLocation || "—"}</div>
                        <div className="flex items-center gap-2"><Home className="h-4 w-4" /> Preparação noiva: {selectedWedding.bridePrepLocation || "—"}</div>
                        <div className="flex items-center gap-2"><Home className="h-4 w-4" /> Preparação noivo: {selectedWedding.groomPrepLocation || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                      <div className="space-y-2 text-sm text-[#1e3a5f]">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Prep. noivo: {selectedWedding.groomPrepTime || "—"}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Prep. noiva: {selectedWedding.bridePrepTime || "—"}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Cerimónia: {selectedWedding.ceremony || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Camera className="h-4 w-4" />} title="Serviço" />
                      <div className="space-y-2 text-sm text-[#1e3a5f]">
                        <div className="flex items-center gap-2"><Camera className="h-4 w-4" /> Pack: {selectedWedding.package || "—"}</div>
                        <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Tipo de entrega: {selectedWedding.delivery || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Euro className="h-4 w-4" />} title="Financeiro" />
                      <div className="space-y-2 text-sm text-[#1e3a5f]">
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Total: {selectedWedding.total || "—"}</div>
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Sinal: {selectedWedding.signal || "—"}</div>
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Falta pagar: {selectedWedding.balance || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <SectionTitle icon={<Euro className="h-4 w-4" />} title="Custos Internos" />
                      <div className="space-y-2 text-sm text-[#1e3a5f]">
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Custos da equipa: {selectedWedding.teamCosts || "—"}</div>
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Custos laboratório: {selectedWedding.laboratoryCosts || "—"}</div>
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4" /> Custos extras: {selectedWedding.extraCosts || "—"}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#eef3fb] p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#4b7abf]">
                        <FileText className="h-4 w-4" />
                        Notas
                      </div>
                      <p className="text-sm leading-6 text-[#2d5986]">
                        {selectedWedding.notes || "Sem notas."}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-[#4b7abf]">Seleciona um casamento.</p>
              )}
            </div>

            <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#1e3a5f]">
                  Checklist do Casal
                </h2>
                <div className="rounded-2xl bg-[#dbeafe] px-3 py-2 text-sm text-[#4b7abf]">
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
                            ? "border-[#93c5fd] bg-[#dbeafe] text-[#1e3a5f]"
                            : "border-[#bfdbfe] bg-[#eef3fb] text-[#4b7abf]"
                        }`}
                      >
                        <CheckSquare
                          className={`h-5 w-5 ${
                            checked ? "text-[#2563eb]" : "text-[#93c5fd]"
                          }`}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#4b7abf]">Seleciona um casamento para ver a checklist.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#bfdbfe] bg-[#f5f9ff] p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-[#1e3a5f]">
              Adicionar Casamento
            </h2>

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
                  <InputField
                    type="date"
                    placeholder="Data"
                    value={form.date}
                    onChange={(value) => updateForm("date", value)}
                  />
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value as WeddingStatus)}
                      className="w-full appearance-none rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2.5 text-[#1e3a5f] outline-none focus:border-[#2563eb]"
                    >
                      <option>Pendente</option>
                      <option>Confirmado</option>
                      <option>Editado</option>
                      <option>Entregue</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563eb]" />
                  </div>
                  <InputField
                    placeholder="Pack contratado"
                    value={form.package}
                    onChange={(value) => updateForm("package", value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <InputField
                      placeholder="Total"
                      value={form.total}
                      onChange={(value) => updateForm("total", value)}
                    />
                    <InputField
                      placeholder="Sinal"
                      value={form.signal}
                      onChange={(value) => updateForm("signal", value)}
                    />
                    <InputField
                      placeholder="Falta pagar"
                      value={form.balance}
                      onChange={(value) => updateForm("balance", value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <InputField
                      placeholder="Custos da equipa"
                      value={form.teamCosts}
                      onChange={(value) => updateForm("teamCosts", value)}
                    />
                    <InputField
                      placeholder="Custos laboratorio"
                      value={form.laboratoryCosts}
                      onChange={(value) => updateForm("laboratoryCosts", value)}
                    />
                    <InputField
                      placeholder="Custos extras"
                      value={form.extraCosts}
                      onChange={(value) => updateForm("extraCosts", value)}
                    />
                  </div>
                  <div>
                    <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Horários combinados" />
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Preparação do Noivo</label>
                        <InputField
                          type="time"
                          placeholder="HH:MM"
                          value={form.groomPrepTime}
                          onChange={(value) => updateForm("groomPrepTime", value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Preparação da Noiva</label>
                        <InputField
                          type="time"
                          placeholder="HH:MM"
                          value={form.bridePrepTime}
                          onChange={(value) => updateForm("bridePrepTime", value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4b7abf]">Cerimónia</label>
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
                      className="min-h-[120px] w-full rounded-2xl border border-[#bfdbfe] bg-[#f5f9ff] px-3 py-2.5 text-[#1e3a5f] outline-none transition focus:border-[#2563eb]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addWedding}
                className="flex w-full items-center justify-center rounded-2xl bg-[#2563eb] px-4 py-3 text-white transition hover:opacity-90"
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
