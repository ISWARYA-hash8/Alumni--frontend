import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getMyProfile, updateProfile } from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";

const DEPARTMENTS = [
  "Computer Science Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics and Communication Engineering",
  "Information Technology",
  "Business Administration",
  "Electrical and Instrumentation Engineering",
  "Information Science",
  "Computer Technology",
  "Computer Science and Business Systems",
  "Mechatronics Engineering",
  "Fashion Technology",
  "Food Technology",
  "Agricultural Engineering",
  "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning",
  "Biotechnology",
  "Biomedical",
  "Textile Engineering",
  "Computer Science and Design",
  "Other"
];

const defaultForm = {
  name: "",
  batchYear: "",
  department: "",
  profession: "",
  location: "",
  contact: "",
  linkedinUrl: "",
  profilePhoto: "",
  skills: []
};

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

const getProfilePhoto = (data = {}) =>
  data.profilePhoto || data.profileImageUrl || data.avatarUrl || "";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "A";

function MyProfile() {
  const [formData, setFormData] = useState(defaultForm);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const { updateUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        const data = response.data || {};

        setFormData({
          name: data.name || "",
          batchYear: data.batchYear || "",
          department: data.department || "",
          profession: data.profession || "",
          location: data.location || "",
          contact: data.contact || "",
          linkedinUrl: data.linkedinUrl || "",
          profilePhoto: getProfilePhoto(data),
          skills: data.skills ? data.skills.split(",").filter(Boolean) : []
        });
      } catch (error) {
        addToast(getErrorMessage(error, "Unable to load profile."), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [addToast]);

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (
      formData.linkedinUrl &&
      !/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i.test(formData.linkedinUrl)
    ) {
      nextErrors.linkedinUrl = "Enter a valid LinkedIn profile URL.";
    }

    if (formData.batchYear && !/^\d{4}$/.test(formData.batchYear)) {
      nextErrors.batchYear = "Batch year should be a 4 digit year.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read the selected image."));
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file for your profile photo.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      addToast("Profile photo must be 2 MB or smaller.", "error");
      event.target.value = "";
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setFormData((current) => ({
        ...current,
        profilePhoto: imageDataUrl
      }));
      addToast("Profile photo selected. Save profile to keep it.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to use that image."), "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormData((current) => ({
      ...current,
      profilePhoto: ""
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        name: formData.name.trim(),
        batchYear: formData.batchYear,
        department: formData.department,
        profession: formData.profession,
        location: formData.location,
        contact: formData.contact,
        linkedinUrl: formData.linkedinUrl.trim(),
        profilePhoto: formData.profilePhoto,
        skills: formData.skills.join(",")
      });

      updateUser({
        name: formData.name.trim(),
        profilePhoto: formData.profilePhoto
      });

      addToast("Profile updated successfully.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Profile update failed."), "error");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || formData.skills.includes(skill)) {
      return;
    }

    setFormData((current) => ({
      ...current,
      skills: [...current.skills, skill]
    }));
    setNewSkill("");
  };

  const removeSkill = (index) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.filter((_, currentIndex) => currentIndex !== index)
    }));
  };

  if (loading) {
    return <Loader label="Loading profile..." />;
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="My Profile"
        subtitle="Keep your alumni profile updated so the directory stays useful and professional."
      />

      <div className="max-w-5xl rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt={formData.name || "Profile preview"}
                className="h-24 w-24 rounded-3xl object-cover shadow-soft"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-2xl font-bold text-white shadow-soft">
                {getInitials(formData.name)}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-500">
                Profile Photo
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Add a clear headshot for your alumni profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Use JPG, PNG, or WebP up to 2 MB.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              className="inline-flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              {formData.profilePhoto ? "Change Photo" : "Upload Photo"}
            </Button>
            {formData.profilePhoto ? (
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2"
                onClick={handleRemovePhoto}
              >
                <Trash2 size={16} />
                Remove
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500">
                <Camera size={16} />
                No photo selected
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              className="glass-input mt-2"
            />
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Batch Year</label>
            <input
              type="text"
              value={formData.batchYear}
              onChange={(event) =>
                setFormData((current) => ({ ...current, batchYear: event.target.value }))
              }
              className="glass-input mt-2"
              placeholder="2024"
            />
            {errors.batchYear ? <p className="mt-2 text-sm text-red-600">{errors.batchYear}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Department</label>
            <select
              value={formData.department}
              onChange={(event) =>
                setFormData((current) => ({ ...current, department: event.target.value }))
              }
              className="glass-input mt-2"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Profession</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(event) =>
                setFormData((current) => ({ ...current, profession: event.target.value }))
              }
              className="glass-input mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Contact</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(event) =>
                setFormData((current) => ({ ...current, contact: event.target.value }))
              }
              className="glass-input mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(event) =>
                setFormData((current) => ({ ...current, location: event.target.value }))
              }
              className="glass-input mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">LinkedIn Profile</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(event) =>
                setFormData((current) => ({ ...current, linkedinUrl: event.target.value }))
              }
              className="glass-input mt-2"
              placeholder="https://www.linkedin.com/in/your-profile"
            />
            {errors.linkedinUrl ? (
              <p className="mt-2 text-sm text-red-600">{errors.linkedinUrl}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Skills</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                className="glass-input flex-1"
                placeholder="Add a skill"
              />
              <Button type="button" onClick={addSkill}>
                Add Skill
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                >
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(index)} />
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full md:w-auto" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyProfile;
