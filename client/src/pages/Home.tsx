import { useMemo, useState, type FormEvent } from "react";
import { BookOpenCheck, Check, CircleDollarSign, Loader2, LogOut, Pencil, Plus, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type FeeStatus = "Paid" | "Pending";
type FeeRecord = {
  id: number;
  studentName: string;
  rollNumber: string;
  course: string;
  amount: string;
  status: FeeStatus;
};
type FeeForm = Omit<FeeRecord, "id" | "amount"> & { amount: string };

const emptyForm: FeeForm = {
  studentName: "",
  rollNumber: "",
  course: "",
  amount: "",
  status: "Pending",
};
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const formatMoney = (amount: number | string) => currency.format(Number(amount) || 0);

function BrandMark({ className = "" }: { className?: string }) {
  return <img className={className} src="/fee-mark.svg" alt="" aria-hidden="true" />;
}

export default function Home() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FeeForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | FeeStatus>("All");

  const recordsQuery = trpc.feeRecords.list.useQuery(undefined, {
    enabled: auth.isAuthenticated,
    retry: false,
  });
  const createRecord = trpc.feeRecords.create.useMutation();
  const updateRecord = trpc.feeRecords.update.useMutation();
  const deleteRecord = trpc.feeRecords.delete.useMutation();

  const records = (recordsQuery.data ?? []) as FeeRecord[];
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return records.filter(record => {
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const matchesSearch = !term || [record.studentName, record.rollNumber, record.course]
        .some(value => value.toLocaleLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  const collected = records.reduce((sum, record) => sum + (record.status === "Paid" ? Number(record.amount) : 0), 0);
  const pending = records.reduce((sum, record) => sum + (record.status === "Pending" ? Number(record.amount) : 0), 0);
  const isSaving = createRecord.isPending || updateRecord.isPending;
  const accessDenied = recordsQuery.error?.data?.code === "FORBIDDEN";

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.studentName.trim() || !form.rollNumber.trim() || !form.course.trim()) {
      toast.error("Complete all student details before saving.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
      toast.error("Enter a fee amount greater than zero with up to two decimal places.");
      return;
    }

    const values = {
      studentName: form.studentName.trim(),
      rollNumber: form.rollNumber.trim(),
      course: form.course.trim(),
      amount,
      status: form.status,
    };

    try {
      if (editingId !== null) {
        await updateRecord.mutateAsync({ id: editingId, ...values });
        toast.success("Fee record updated.");
      } else {
        await createRecord.mutateAsync(values);
        toast.success("Fee record added.");
      }
      resetForm();
      await utils.feeRecords.list.invalidate();
    } catch {
      toast.error("Could not save this record. Please try again.");
    }
  };

  const beginEdit = (record: FeeRecord) => {
    setEditingId(record.id);
    setForm({
      studentName: record.studentName,
      rollNumber: record.rollNumber,
      course: record.course,
      amount: Number(record.amount).toFixed(2),
      status: record.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeRecord = async (record: FeeRecord) => {
    const confirmed = window.confirm(`Delete the fee record for ${record.studentName}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteRecord.mutateAsync({ id: record.id });
      toast.success("Fee record deleted.");
      await utils.feeRecords.list.invalidate();
    } catch {
      toast.error("Could not delete this record. Please try again.");
    }
  };

  if (auth.loading) {
    return <div className="fee-loading"><Loader2 className="animate-spin" size={24} />Checking staff access…</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <main className="fee-login-page">
        <section className="fee-login-card">
          <BrandMark className="fee-login-mark" />
          <p className="fee-eyebrow">STUDENT ACCOUNTS</p>
          <h1>Fee collection, clearly in hand.</h1>
          <p className="fee-login-copy">Sign in with an authorized staff account to manage student fee records.</p>
          <Button className="fee-primary-button fee-signin-button" onClick={() => startLogin()}>
            <ShieldCheck size={17} /> Sign in securely
          </Button>
          <p className="fee-login-footnote">Student records are visible only to approved staff.</p>
        </section>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="fee-login-page">
        <section className="fee-login-card fee-denied-card">
          <BrandMark className="fee-login-mark" />
          <p className="fee-eyebrow">ACCESS RESTRICTED</p>
          <h1>This account isn’t on the staff list.</h1>
          <p className="fee-login-copy">Ask your fee administrator to authorize the email address linked to your sign-in.</p>
          <Button className="fee-secondary-button" onClick={() => void auth.logout()}>
            <LogOut size={17} /> Sign out
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="fee-app">
      <header className="fee-topbar">
        <a className="fee-brand" href="/" aria-label="Student fee ledger home">
          <BrandMark className="fee-brand-mark" />
          <span><strong>Campus Ledger</strong><small>STUDENT FEE MANAGEMENT</small></span>
        </a>
        <div className="fee-user-tools">
          <span className="fee-staff-label"><ShieldCheck size={15} /> STAFF ACCESS</span>
          <span className="fee-user-name">{auth.user?.name || auth.user?.email || "Staff"}</span>
          <Button variant="ghost" className="fee-signout" onClick={() => void auth.logout()} aria-label="Sign out">
            <LogOut size={17} /><span>Sign out</span>
          </Button>
        </div>
      </header>

      <section className="fee-page-heading">
        <div>
          <p className="fee-eyebrow">FEE OFFICE <span>·</span> RECORDS</p>
          <h1>Student fee ledger</h1>
          <p className="fee-subheading">Keep every payment and pending balance in one clear view.</p>
        </div>
        <div className="fee-heading-note"><BookOpenCheck size={18} /> Secure staff workspace</div>
      </section>

      <section className="fee-summary-grid" aria-label="Fee summary">
        <article className="fee-summary-card fee-summary-collected">
          <span className="fee-summary-icon"><CircleDollarSign size={19} /></span>
          <p>Fees collected</p>
          <strong>{formatMoney(collected)}</strong>
          <small>Paid records only</small>
        </article>
        <article className="fee-summary-card">
          <span className="fee-summary-icon fee-summary-icon-amber"><CircleDollarSign size={19} /></span>
          <p>Fees pending</p>
          <strong>{formatMoney(pending)}</strong>
          <small>Awaiting payment</small>
        </article>
        <article className="fee-summary-card">
          <span className="fee-summary-icon fee-summary-icon-slate"><Users size={19} /></span>
          <p>Student records</p>
          <strong>{records.length.toLocaleString("en-IN")}</strong>
          <small>Across all courses</small>
        </article>
      </section>

      <section className="fee-workspace">
        <aside className="fee-panel fee-entry-panel">
          <div className="fee-panel-heading">
            <div><p className="fee-eyebrow">RECORD ENTRY</p><h2>{editingId === null ? "Add a fee record" : "Update record"}</h2></div>
            {editingId !== null && <span className="fee-editing-tag"><Pencil size={13} /> Editing</span>}
          </div>
          <form className="fee-form" onSubmit={handleSubmit}>
            <label>Student name<input autoComplete="off" maxLength={150} placeholder="e.g. Asha Sharma" value={form.studentName} onChange={event => setForm({ ...form, studentName: event.target.value })} required /></label>
            <label>Roll number<input autoComplete="off" maxLength={80} placeholder="e.g. 24CS018" value={form.rollNumber} onChange={event => setForm({ ...form, rollNumber: event.target.value })} required /></label>
            <label>Course<input autoComplete="off" maxLength={150} placeholder="e.g. B.Sc. Computer Science" value={form.course} onChange={event => setForm({ ...form, course: event.target.value })} required /></label>
            <div className="fee-form-row">
              <label>Fee amount (INR)<div className="fee-amount-input"><span>₹</span><input type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} required /></div></label>
              <label>Payment status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as FeeStatus })}><option value="Paid">Paid</option><option value="Pending">Pending</option></select></label>
            </div>
            <div className="fee-form-actions">
              <Button type="submit" className="fee-primary-button" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : editingId === null ? <Plus size={17} /> : <Check size={17} />}
                {editingId === null ? "Add record" : "Save changes"}
              </Button>
              <Button type="button" variant="ghost" className="fee-clear-button" onClick={resetForm} disabled={isSaving}>
                {editingId === null ? <><X size={16} /> Clear</> : "Cancel edit"}
              </Button>
            </div>
          </form>
          <div className="fee-private-note"><ShieldCheck size={16} /><span>Only approved staff can view or change these records.</span></div>
        </aside>

        <section className="fee-panel fee-records-panel">
          <div className="fee-panel-heading fee-records-heading">
            <div><p className="fee-eyebrow">COLLECTION REGISTER</p><h2>Fee records <span className="fee-count">{records.length}</span></h2></div>
            <div className="fee-filter-row">
              <label className="fee-search"><Search size={16} /><input aria-label="Search students" placeholder="Search name, roll no. or course" value={search} onChange={event => setSearch(event.target.value)} /></label>
              <select aria-label="Filter by payment status" className="fee-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "All" | FeeStatus)}><option value="All">All statuses</option><option value="Paid">Paid</option><option value="Pending">Pending</option></select>
            </div>
          </div>

          {recordsQuery.isLoading ? (
            <div className="fee-table-state"><Loader2 className="animate-spin" size={22} />Loading fee records…</div>
          ) : recordsQuery.error ? (
            <div className="fee-table-state fee-error-state">We couldn’t load the fee register. Refresh the page or try again shortly.</div>
          ) : filteredRecords.length === 0 ? (
            <div className="fee-empty-state">
              <span className="fee-empty-icon"><BookOpenCheck size={24} /></span>
              <strong>{records.length === 0 ? "Your register is ready" : "No matching records"}</strong>
              <p>{records.length === 0 ? "Add the first student fee record using the form." : "Try a different search or status filter."}</p>
            </div>
          ) : (
            <div className="fee-table-wrap">
              <table className="fee-table">
                <thead><tr><th>ID</th><th>Student</th><th>Roll number</th><th>Course</th><th>Fee amount</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td className="fee-id-cell">{record.id.toString().padStart(3, "0")}</td>
                    <td className="fee-student-cell">{record.studentName}</td>
                    <td>{record.rollNumber}</td>
                    <td>{record.course}</td>
                    <td className="fee-amount-cell">{formatMoney(record.amount)}</td>
                    <td><span className={`fee-status-pill ${record.status === "Paid" ? "is-paid" : "is-pending"}`}><span />{record.status}</span></td>
                    <td><div className="fee-row-actions"><button className="fee-icon-button" type="button" aria-label={`Edit ${record.studentName}`} title="Edit record" onClick={() => beginEdit(record)}><Pencil size={15} /></button><button className="fee-icon-button fee-delete-button" type="button" aria-label={`Delete ${record.studentName}`} title="Delete record" onClick={() => void removeRecord(record)}><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="fee-register-footer"><span>Showing {filteredRecords.length} of {records.length} records</span><span><Check size={14} /> Changes save automatically to the register</span></div>
        </section>
      </section>
      <footer className="fee-footer"><span>Campus Ledger <span>·</span> Student accounts workspace</span><span>Amounts shown in Indian rupees (INR)</span></footer>
    </main>
  );
}
