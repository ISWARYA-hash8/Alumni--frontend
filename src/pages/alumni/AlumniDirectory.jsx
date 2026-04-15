import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Linkedin } from "lucide-react";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { getAlumni } from "../../services/apiService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 9;

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        const response = await getAlumni();
        setAlumni(response.data || []);
      } catch (error) {
        addToast(getErrorMessage(error, "Unable to load alumni directory."), "error");
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, [addToast]);

  const filtered = useMemo(() => {
    return alumni.filter((item) => {
      const matchesSearch =
        !search ||
        [item.name, item.skills, item.location, item.profession]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()));

      const matchesBatch = !batchFilter || item.batchYear?.toString() === batchFilter;
      const matchesDepartment = !deptFilter || item.department === deptFilter;

      return matchesSearch && matchesBatch && matchesDepartment;
    });
  }, [alumni, batchFilter, deptFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, batchFilter, deptFilter, alumni.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered]);

  if (loading) {
    return <Loader label="Loading alumni directory..." />;
  }

  const handleConnect = (item) => {
    if (!item.linkedinUrl) {
      addToast("Couldn't connect. Try later.", "error");
      return;
    }

    window.open(item.linkedinUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Alumni Directory"
        subtitle={`${alumni.length} verified alumni available in the network.`}
      />

      <div className="grid gap-4 rounded-3xl bg-white p-5 shadow-soft md:grid-cols-3">
        <input
          placeholder="Search by name, skills, profession, or location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="glass-input md:col-span-3"
        />

        <select
          className="glass-input"
          value={batchFilter}
          onChange={(event) => setBatchFilter(event.target.value)}
        >
          <option value="">All Batches</option>
          {[...new Set(alumni.map((item) => item.batchYear).filter(Boolean))].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="glass-input"
          value={deptFilter}
          onChange={(event) => setDeptFilter(event.target.value)}
        >
          <option value="">All Departments</option>
          {[...new Set(alumni.map((item) => item.department).filter(Boolean))].map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          onClick={() => {
            setSearch("");
            setBatchFilter("");
            setDeptFilter("");
          }}
        >
          Reset Filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          No alumni matched the current filters.
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedAlumni.map((item) => {
              const initials = item.name
                ?.split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <article key={item.userId} className="glass-card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name || "Alumni"}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
                          {initials || "A"}
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{item.name || "Alumni"}</h3>
                        <p className="text-sm text-slate-500">{item.profession || "Profession not updated"}</p>
                      </div>
                    </div>

                    {item.linkedinUrl ? (
                      <a
                        href={item.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        <Linkedin size={16} />
                        LinkedIn
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Department:</span> {item.department || "Not shared"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Batch:</span> {item.batchYear || "Not shared"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Location:</span> {item.location || "Not shared"}
                    </p>
                  </div>

                  {item.skills ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.skills.split(",").map((skill) => (
                        <span
                          key={`${item.userId}-${skill.trim()}`}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleConnect(item)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Connect
                    <ExternalLink size={16} />
                  </button>
                </article>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            itemLabel="alumni"
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default AlumniDirectory;
