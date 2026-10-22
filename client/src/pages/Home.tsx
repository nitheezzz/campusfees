import { useMemo, useState, type FormEvent } from "react";
import { BookOpenCheck, Check, CircleDollarSign, Loader2, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  status: "Paid",
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
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FeeForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | FeeStatus>("All");
  const recordsQuery = trpc.feeRecords.list.useQuery(undefined, { retry: false });
  const createRecord = trpc.feeRecords.create.useMutation();
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

    try {
      await createRecord.mutateAsync({
        studentName: form.studentName.trim(),
        rollNumber: form.rollNumber.trim(),
        course: form.course.trim(),
        amount,
        status: form.status,
      });
      toast.success("Your fee entry has been added to the public ledger.");
      setForm(emptyForm);
      await utils.feeRecords.list.invalidate();
    } catch {
      toast.error("Could not add this entry. Please try again.");
    }
  };

  return (
    <main className="fee-app">
      <header className="fee-topbar">
        <a className="fee-brand" href="/" aria-label="Student fee ledger home">
          <BrandMark className="fee-brand-mark" />
          <span><strong>Campus Ledger</strong><small>STUDENT FEE MANAGEMENT</small></span>
        </a>
        <span className="fee-public-label"><Users size={15} /> PUBLIC LEDGER</span>
      </header>

      <section className="fee-page-heading">
        <div>
          <p className="fee-eyebrow">FEE OFFICE <span>·</span> PUBLIC RECORDS</p>
          <h1>Student fee ledger</h1>
          <p className="fee-subheading">Browse fee entries or add a payment record to the register.</p>
        </div>
        <div className="fee-heading-note"><BookOpenCheck size={18} /> Open to everyone</div>
      </section>

      <div className="fee-public-disclosure" role="note">
        <strong>Public information:</strong> student names, roll numbers, courses, fee amounts, and payment statuses on this page are visible to anyone. New entries are self-reported and are not verified against an actual payment.
      </div>

      <section className="fee-summary-grid" aria-label="Fee summary">
        <article className="fee-summary-card fee-summary-collected">
          <span className="fee-summary-icon"><CircleDollarSign size={19} /></span>
          <p>Fees marked paid</p>
          <strong>{formatMoney(collected)}</strong>
          <small>Self-reported Paid entries</small>
        </article>
        <article className="fee-summary-card">
          <span className="fee-summary-icon fee-summary-icon-amber"><CircleDollarSign size={19} /></span>
          <p>Fees marked pending</p>
          <strong>{formatMoney(pending)}</strong>
          <small>Self-reported Pending entries</small>
        </article>
        <article className="fee-summary-card">
          <span className="fee-summary-icon fee-summary-icon-slate"><Users size={19} /></span>
          <p>Fee entries</p>
          <strong>{records.length.toLocaleString("en-IN")}</strong>
          <small>Visible to all visitors</small>
        </article>
      </section>

      <section className="fee-workspace">
        <aside className="fee-panel fee-entry-panel">
          <div className="fee-panel-heading">
            <div><p className="fee-eyebrow">PUBLIC SUBMISSION</p><h2>Add a fee entry</h2></div>
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
              <Button type="submit" className="fee-primary-button" disabled={createRecord.isPending}>
                {createRecord.isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={17} />}
                Add public entry
              </Button>
              <Button type="button" variant="ghost" className="fee-clear-button" onClick={() => setForm(emptyForm)} disabled={createRecord.isPending}>Clear</Button>
            </div>
          </form>
          <div className="fee-private-note"><Check size={16} /><span>New submissions appear in this public list. Payment status is not independently verified.</span></div>
        </aside>

        <section className="fee-panel fee-records-panel">
          <div className="fee-panel-heading fee-records-heading">
            <div><p className="fee-eyebrow">OPEN COLLECTION REGISTER</p><h2>Fee records <span className="fee-count">{records.length}</span></h2></div>
            <div className="fee-filter-row">
              <label className="fee-search"><Search size={16} /><input aria-label="Search students" placeholder="Search name, roll no. or course" value={search} onChange={event => setSearch(event.target.value)} /></label>
              <select aria-label="Filter by payment status" className="fee-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "All" | FeeStatus)}><option value="All">All statuses</option><option value="Paid">Paid</option><option value="Pending">Pending</option></select>
            </div>
          </div>

          {recordsQuery.isLoading ? (
            <div className="fee-table-state"><Loader2 className="animate-spin" size={22} />Loading public fee records…</div>
          ) : recordsQuery.error ? (
            <div className="fee-table-state fee-error-state">We couldn’t load the fee register. Refresh the page or try again shortly.</div>
          ) : filteredRecords.length === 0 ? (
            <div className="fee-empty-state">
              <span className="fee-empty-icon"><BookOpenCheck size={24} /></span>
              <strong>{records.length === 0 ? "The public register is ready" : "No matching records"}</strong>
              <p>{records.length === 0 ? "Add the first fee entry using the form." : "Try a different search or status filter."}</p>
            </div>
          ) : (
            <div className="fee-table-wrap">
              <table className="fee-table">
                <thead><tr><th>ID</th><th>Student</th><th>Roll number</th><th>Course</th><th>Fee amount</th><th>Status</th></tr></thead>
                <tbody>{filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td className="fee-id-cell">{record.id.toString().padStart(3, "0")}</td>
                    <td className="fee-student-cell">{record.studentName}</td>
                    <td>{record.rollNumber}</td>
                    <td>{record.course}</td>
                    <td className="fee-amount-cell">{formatMoney(record.amount)}</td>
                    <td><span className={`fee-status-pill ${record.status === "Paid" ? "is-paid" : "is-pending"}`}><span />{record.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="fee-register-footer"><span>Showing {filteredRecords.length} of {records.length} records</span><span><Check size={14} /> Public and self-reported</span></div>
        </section>
      </section>
      <footer className="fee-footer"><span>Campus Ledger <span>·</span> Public student fee register</span><span>Amounts shown in Indian rupees (INR)</span></footer>
    </main>
  );
}
