import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, PlusCircle, Trash2, Upload } from "lucide-react";
import { addSingleAlumni, deletePreloadedAlumni, getPreloadedAlumni, uploadAlumniCsv } from "../../services/apiService";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

const initialManualForm = {
  email: "",
  name: "",
  batchYear: "",
  department: ""
};

function CreateAlumni() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [registryEntries, setRegistryEntries] = useState([]);
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 8;

  const loadRegistryEntries = useCallback(async () => {
    setRegistryLoading(true);
    try {
      const response = await getPreloadedAlumni();
      setRegistryEntries(response.data || []);
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load preloaded alumni."), "error");
    } finally {
      setRegistryLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRegistryEntries();
  }, [loadRegistryEntries]);

  const totalPages = Math.max(1, Math.ceil(registryEntries.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRegistryEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return registryEntries.slice(start, start + pageSize);
  }, [currentPage, registryEntries]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setFile(null);
      event.target.value = "";
      addToast("Only CSV files are supported here. Please upload a .csv file, not .xlsx.", "error");
      return;
    }

    setFile(selectedFile);
  };

  const handleCsvSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      addToast("Please choose a CSV file first.", "error");
      return;
    }

    setCsvLoading(true);

    try {
      const response = await uploadAlumniCsv(file);
      setSummary(response.data || null);
      setFile(null);
      await loadRegistryEntries();
      addToast("Alumni CSV uploaded successfully.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to upload alumni CSV."), "error");
    } finally {
      setCsvLoading(false);
    }
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    setManualLoading(true);

    try {
      await addSingleAlumni({
        email: manualForm.email.trim(),
        name: manualForm.name.trim(),
        batchYear: manualForm.batchYear.trim(),
        department: manualForm.department.trim()
      });
      setManualForm(initialManualForm);
      await loadRegistryEntries();
      addToast("Alumni added to the preload registry.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to add alumni manually."), "error");
    } finally {
      setManualLoading(false);
    }
  };

  const handleManualChange = (event) => {
    const { name, value } = event.target;
    setManualForm((current) => ({ ...current, [name]: value }));
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(`Delete preload entry for ${entry.name || entry.email}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(entry.id);
    try {
      await deletePreloadedAlumni(entry.id);
      setRegistryEntries((current) => current.filter((item) => item.id !== entry.id));
      addToast("Preloaded alumni deleted successfully.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to delete preloaded alumni."), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Preload Alumni Access"
        subtitle="Admin can either upload a CSV for bulk onboarding or add one alumni manually to the Google-login registry."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr,0.9fr]">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <PlusCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add One Alumni</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use this when you need to preload a single alumni email without preparing a CSV file.
              </p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={manualForm.email}
                onChange={handleManualChange}
                className="glass-input mt-2"
                placeholder="alumni@bitsathy.ac.in"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Name</label>
              <input
                name="name"
                value={manualForm.name}
                onChange={handleManualChange}
                className="glass-input mt-2"
                placeholder="Alumni full name"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Batch Year</label>
                <input
                  name="batchYear"
                  value={manualForm.batchYear}
                  onChange={handleManualChange}
                  className="glass-input mt-2"
                  placeholder="2026"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Department</label>
                <input
                  name="department"
                  value={manualForm.department}
                  onChange={handleManualChange}
                  className="glass-input mt-2"
                  placeholder="CSE"
                />
              </div>
            </div>

            <Button type="submit" className="inline-flex items-center gap-2" disabled={manualLoading}>
              <PlusCircle size={16} />
              {manualLoading ? "Adding..." : "Add Alumni"}
            </Button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <form onSubmit={handleCsvSubmit} className="space-y-6">
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                  <FileSpreadsheet size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">Upload CSV</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use columns in this order: <span className="font-semibold">email,name,batchYear,department</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Example: <span className="font-semibold">alumni@bitsathy.ac.in,Anitha R,2021,CSE</span>
                  </p>
                  <p className="mt-2 text-sm text-amber-600">
                    Excel files are not supported here. Please save the sheet as <span className="font-semibold">.csv</span> before uploading.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Choose CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="glass-input mt-2"
              />
              {file ? <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p> : null}
            </div>

            <Button type="submit" className="inline-flex items-center gap-2" disabled={csvLoading}>
              <Upload size={16} />
              {csvLoading ? "Uploading..." : "Upload CSV"}
            </Button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Import Summary</h2>
          <p className="mt-2 text-sm text-slate-500">
            Bulk upload summary appears here after the CSV is processed.
          </p>

          {summary ? (
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total Rows</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalRows}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Imported</p>
                <p className="mt-2 text-2xl font-bold text-emerald-500">{summary.importedCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Updated</p>
                <p className="mt-2 text-2xl font-bold text-indigo-600">{summary.updatedCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Skipped</p>
                <p className="mt-2 text-2xl font-bold text-amber-500">{summary.skippedCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-2 font-semibold text-slate-800">{summary.message}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
              Upload a CSV to see the import summary here.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preloaded Alumni</h2>
            <p className="mt-2 text-sm text-slate-500">
              Delete wrong preload entries here. Registered alumni entries are protected from deletion.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Total entries: <span className="text-slate-900">{registryEntries.length}</span>
          </p>
        </div>

        {registryLoading ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
            Loading preload registry...
          </div>
        ) : registryEntries.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
            No preloaded alumni found yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {paginatedRegistryEntries.map((entry) => {
              const isRegistered = entry.registrationStatus === "REGISTERED";

              return (
                <div
                  key={entry.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">{entry.name}</p>
                    <p className="text-sm text-slate-500">{entry.email}</p>
                    <p className="text-sm text-slate-500">
                      {entry.batchYear || "Batch not set"} • {entry.department || "Department not set"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Status: {entry.registrationStatus}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isRegistered ? (
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                        Registered
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="danger"
                        className="inline-flex items-center gap-2"
                        disabled={deletingId === entry.id}
                        onClick={() => handleDelete(entry)}
                      >
                        <Trash2 size={16} />
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={registryEntries.length}
          pageSize={pageSize}
          itemLabel="preloaded alumni"
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default CreateAlumni;
