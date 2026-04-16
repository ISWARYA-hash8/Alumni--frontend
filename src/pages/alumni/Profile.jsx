import { useEffect, useState, useRef } from "react";
import { X, Upload, Trash2, Camera } from "lucide-react";

import { getMyProfile, updateProfile } from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
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
      reader.onerror = () =>
        reject(new Error("Unable to read the selected image."));
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      addToast("Image must be ≤ 2MB.", "error");
      event.target.value = "";
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        profilePhoto: imageDataUrl
      }));
      addToast("Photo selected. Save to apply.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Image error."), "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      await updateProfile({
        ...formData,
        name: formData.name.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        skills: formData.skills.join(",")
      });

      updateUser({
        name: formData.name.trim(),
        profilePhoto: formData.profilePhoto
      });

      addToast("Profile updated successfully.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Update failed."), "error");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || formData.skills.includes(skill)) return;

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    setNewSkill("");
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="My Profile"
        subtitle="Keep your alumni profile updated."
      />

      <div className="max-w-5xl rounded-3xl bg-white p-6 shadow-soft md:p-8">
        {/* PROFILE PHOTO */}
        <div className="mb-8 flex flex-col md:flex-row justify-between gap-5">
          <div className="flex items-center gap-4">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Profile"
                className="h-24 w-24 rounded-3xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 flex items-center justify-center bg-indigo-600 text-white rounded-3xl text-xl">
                {getInitials(formData.name)}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Upload
            </Button>

            {formData.profilePhoto && (
              <Button variant="outline" onClick={handleRemovePhoto}>
                <Trash2 size={16} /> Remove
              </Button>
            )}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <input
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Full Name"
            className="glass-input"
          />

          <input
            value={formData.batchYear}
            onChange={(e) =>
              setFormData((p) => ({ ...p, batchYear: e.target.value }))
            }
            placeholder="Batch Year"
            className="glass-input"
          />

          <select
            value={formData.department}
            onChange={(e) =>
              setFormData((p) => ({ ...p, department: e.target.value }))
            }
            className="glass-input"
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <input
            value={formData.profession}
            onChange={(e) =>
              setFormData((p) => ({ ...p, profession: e.target.value }))
            }
            placeholder="Profession"
            className="glass-input"
          />

          <input
            value={formData.location}
            onChange={(e) =>
              setFormData((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Location"
            className="glass-input"
          />

          <input
            value={formData.contact}
            onChange={(e) =>
              setFormData((p) => ({ ...p, contact: e.target.value }))
            }
            placeholder="Contact"
            className="glass-input"
          />

          <input
            value={formData.linkedinUrl}
            onChange={(e) =>
              setFormData((p) => ({ ...p, linkedinUrl: e.target.value }))
            }
            placeholder="LinkedIn URL"
            className="glass-input md:col-span-2"
          />

          {/* SKILLS */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill"
                className="glass-input flex-1"
              />
              <Button type="button" onClick={addSkill}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((s, i) => (
                <span key={i} className="bg-gray-200 px-3 py-1 rounded-full">
                  {s}
                  <X
                    className="inline ml-2 cursor-pointer"
                    size={12}
                    onClick={() => removeSkill(i)}
                  />
                </span>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default MyProfile;
