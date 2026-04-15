import { useEffect, useMemo, useState } from "react";
import { deleteUser, getAllUsers, getProfileByAdmin } from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

function ManageAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const pageSize = 10;

  useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setAlumni((response.data || []).filter((user) => user.role === "ALUMNI"));
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load alumni accounts."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete alumni account?")) {
      return;
    }

    try {
      await deleteUser(id);
      addToast("Alumni account deleted.", "success");
      await loadAlumni();
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to delete alumni."), "error");
    }
  };

  const handleViewProfile = async (user) => {
    try {
      setProfileLoading(true);
      const response = await getProfileByAdmin(user.id);
      setSelectedProfile({
        email: user.email,
        verificationStatus: user.verificationStatus,
        ...response.data
      });
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to load alumni profile."), "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const filtered = useMemo(
    () => alumni.filter((item) => item.email.toLowerCase().includes(search.toLowerCase())),
    [alumni, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, alumni.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered]);

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Manage Alumni"
        subtitle="Review admin-created alumni accounts and manage them from one place."
      />

      <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <input
          placeholder="Search alumni by email..."
          className="glass-input md:max-w-md"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Button onClick={loadAlumni}>Refresh</Button>
      </div>

      {loading ? <Loader label="Loading alumni..." /> : null}

      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-sm uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAlumni.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    No alumni matched your search.
                  </td>
                </tr>
              ) : (
                paginatedAlumni.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.verificationStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-600"
                            : item.verificationStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => handleViewProfile(item)}>
                          View Profile
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        itemLabel="alumni"
        onPageChange={setCurrentPage}
      />

      {(selectedProfile || profileLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Alumni Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Full alumni details for admin review
                </p>
              </div>

              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                onClick={() => setSelectedProfile(null)}
              >
                Close
              </button>
            </div>

            {profileLoading ? (
              <Loader label="Loading alumni profile..." />
            ) : selectedProfile ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Name</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.name || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.email}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Batch Year</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.batchYear || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Department</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.department || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Profession</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.profession || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.location || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contact</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.contact || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">LinkedIn</p>
                  <p className="mt-2 break-all font-semibold text-slate-800">
                    {selectedProfile.linkedinUrl || "Not updated"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Skills</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedProfile.skills || "Not updated"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Account Status</p>
                  <p className="mt-2 font-semibold text-slate-800">
                    {selectedProfile.verificationStatus || "APPROVED"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAlumni;
