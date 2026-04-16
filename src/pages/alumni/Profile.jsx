import { useEffect, useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { getMyProfile, updateProfile } from "../../services/apiService";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import { useAuth } from "../../context/AuthContext";

const CLOUD_NAME = "dzapw0oie";   // ✅ your cloud name
const UPLOAD_PRESET = "alumni_upload";

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

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

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "A";

function MyProfile() {
  const [formData, setFormData] = useState(defaultForm);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const { updateUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        const data = res.data || {};

        setFormData({
          ...defaultForm,
          ...data,
          skills: data.skills ? data.skills.split(",") : []
        });
      } catch (err) {
        addToast(getErrorMessage(err, "Failed to load profile"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔥 Cloudinary Upload
  const uploadToCloudinary = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: form
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Only image files allowed", "error");
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      addToast("Max size is 2MB", "error");
      return;
    }

    try {
      setSaving(true);
      const url = await uploadToCloudinary(file);

      setFormData((prev) => ({
        ...prev,
        profilePhoto: url
      }));

      addToast("Image uploaded successfully", "success");
    } catch {
      addToast("Upload failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateProfile({
        ...formData,
        skills: formData.skills.join(",")
      });

      updateUser({
        name: formData.name,
        profilePhoto: formData.profilePhoto
      });

      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(getErrorMessage(err, "Update failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
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
    <div className="p-6 space-y-6">
      <PageHeader title="My Profile" />

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center gap-4 mb-6">
          {formData.profilePhoto ? (
            <img
              src={formData.profilePhoto}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl">
              {getInitials(formData.name)}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handlePhotoChange}
          />

          <Button onClick={() => fileInputRef.current.click()}>
            <Upload size={16} /> Upload
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Full Name"
            className="glass-input"
          />

          <input
            value={formData.batchYear}
            onChange={(e) =>
              setFormData({ ...formData, batchYear: e.target.value })
            }
            placeholder="Batch Year"
            className="glass-input"
          />

          <input
            value={formData.linkedinUrl}
            onChange={(e) =>
              setFormData({ ...formData, linkedinUrl: e.target.value })
            }
            placeholder="LinkedIn URL"
            className="glass-input"
          />

          {/* Skills */}
          <div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill"
                className="glass-input"
              />
              <Button type="button" onClick={addSkill}>
                Add
              </Button>
            </div>

            <div className="flex gap-2 mt-2 flex-wrap">
              {formData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                  {skill}
                  <X size={12} onClick={() => removeSkill(i)} className="cursor-pointer" />
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
