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
  photoUrl: "",
  skills: []
};

function FieldLabel({ children, required = false, optional = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
      {optional ? <span className="ml-2 text-xs font-medium text-slate-400">(Optional)</span> : null}
    </label>
  );
}

function MyProfile() {
  const [formData, setFormData] = useState(defaultForm);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
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
          photoUrl: data.photoUrl || "",
          skills: data.skills
            ? data.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
            : []
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

    if (!formData.batchYear.trim()) {
      nextErrors.batchYear = "Batch year is required.";
    } else if (!/^\d{4}$/.test(formData.batchYear.trim())) {
      nextErrors.batchYear = "Batch year should be a 4 digit year.";
    }

    if (!formData.department) {
      nextErrors.department = "Department is required.";
    }

    if (!formData.profession.trim()) {
      nextErrors.profession = "Profession is required.";
    }

    if (!formData.contact.trim()) {
      nextErrors.contact = "Contact is required.";
    }

    if (!formData.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (
      formData.linkedinUrl &&
      !/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i.test(formData.linkedinUrl)
    ) {
      nextErrors.linkedinUrl = "Enter a valid LinkedIn profile URL.";
    }

    if (formData.photoUrl && !/^https?:\/\/.+/i.test(formData.photoUrl)) {
      nextErrors.photoUrl = "Enter a valid profile photo URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        batchYear: formData.batchYear.trim(),
        department: formData.department,
        profession: formData.profession.trim(),
        location: formData.location.trim(),
        contact: formData.contact.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        photoUrl: formData.photoUrl.trim(),
        skills: formData.skills.join(",")
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

  const initials = formData.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="My Profile"
        subtitle="Keep your alumni profile updated so the directory stays useful and professional."
      />

      <div className="max-w-5xl rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="mb-6 flex flex-col gap-5 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Fields marked with <span className="text-red-500">*</span> are mandatory.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Profile photo is optional and will be shown in your alumni card when provided.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {formData.photoUrl ? (
              <img
                src={formData.photoUrl}
                alt={formData.name || "Profile photo"}
                className="h-20 w-20 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-2xl font-bold text-white">
                {initials || "A"}
              </div>
            )}

            <div>
              <p className="text-lg font-semibold text-slate-900">{formData.name || "Your profile"}</p>
              <p className="text-sm text-slate-500">
                {formData.profession || "Add your profession"}{formData.location ? ` | ${formData.location}` : ""}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel required>Full Name</FieldLabel>
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
            <FieldLabel required>Batch Year</FieldLabel>
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
            <FieldLabel required>Department</FieldLabel>
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
            {errors.department ? <p className="mt-2 text-sm text-red-600">{errors.department}</p> : null}
          </div>

          <div>
            <FieldLabel required>Profession</FieldLabel>
            <input
              type="text"
              value={formData.profession}
              onChange={(event) =>
                setFormData((current) => ({ ...current, profession: event.target.value }))
              }
              className="glass-input mt-2"
            />
            {errors.profession ? <p className="mt-2 text-sm text-red-600">{errors.profession}</p> : null}
          </div>

          <div>
            <FieldLabel required>Contact</FieldLabel>
            <input
              type="text"
              value={formData.contact}
              onChange={(event) =>
                setFormData((current) => ({ ...current, contact: event.target.value }))
              }
              className="glass-input mt-2"
            />
            {errors.contact ? <p className="mt-2 text-sm text-red-600">{errors.contact}</p> : null}
          </div>

          <div>
            <FieldLabel required>Location</FieldLabel>
            <input
              type="text"
              value={formData.location}
              onChange={(event) =>
                setFormData((current) => ({ ...current, location: event.target.value }))
              }
              className="glass-input mt-2"
            />
            {errors.location ? <p className="mt-2 text-sm text-red-600">{errors.location}</p> : null}
          </div>

          <div className="md:col-span-2">
            <FieldLabel optional>Profile Photo URL</FieldLabel>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(event) =>
                setFormData((current) => ({ ...current, photoUrl: event.target.value }))
              }
              className="glass-input mt-2"
              placeholder="https://example.com/photo.jpg"
            />
            {errors.photoUrl ? <p className="mt-2 text-sm text-red-600">{errors.photoUrl}</p> : null}
          </div>

          <div className="md:col-span-2">
            <FieldLabel optional>LinkedIn Profile</FieldLabel>
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
            <FieldLabel optional>Skills</FieldLabel>
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
