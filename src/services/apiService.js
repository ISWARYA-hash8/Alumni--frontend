import API from "../api/axios";

export const getAllUsers = () => API.get("/admin/users");
export const createUser = (data) => API.post("/admin/users", data);
export const uploadAlumniCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/admin/alumni/upload-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
export const getPreloadedAlumni = () => API.get("/admin/alumni");
export const addSingleAlumni = (data) => API.post("/admin/alumni", data);
export const deletePreloadedAlumni = (id) => API.delete(`/admin/alumni/${id}`);
export const verifyUser = (id) => API.put(`/admin/users/${id}/verify`);
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const updateUserStatus = (id, status) =>
  API.put(`/admin/users/${id}/status`, null, { params: { status } });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

export const getMyProfile = () => API.get("/profile/me");
export const updateProfile = (data) => API.put("/profile/me", data);
export const getProfileByAdmin = (id) => API.get(`/profile/admin/${id}`);
export const getAlumni = () => API.get("/alumni");

export const getEvents = () => API.get("/events");
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const registerEvent = (id) => API.post(`/events/${id}/register`);
export const getMyRegistrations = () => API.get("/events/my-registrations");

export const getAnnouncements = () => API.get("/announcements");
export const createAnnouncement = (data) => API.post("/announcements", data);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);
export const filterAnnouncements = (category, priority) =>
  API.get("/announcements/filter", { params: { category, priority } });

export const getPosts = () => API.get("/forum");
export const getSinglePost = (id) => API.get(`/forum/${id}`);
export const createPost = (data) => API.post("/forum", data);
export const likePost = (id) => API.put(`/forum/${id}/like`);
export const deletePost = (id) => API.delete(`/forum/${id}`);
export const filterByCategory = (category) => API.get(`/forum/category/${category}`);

export const createComment = (data) => API.post("/comments", data);
export const getCommentsForPost = (postId) => API.get(`/comments/post/${postId}`);
export const deleteComment = (id) => API.delete(`/comments/${id}`);
export const addCommentToPost = (postId, content) => API.post("/comments", { postId, content });

export const submitFeedback = (data) => API.post("/feedback", data);
export const getAllFeedback = () => API.get("/feedback");

export const getMentors = () => API.get("/mentorship/mentors");
export const discoverMentors = (params) => API.get("/mentorship/mentors", { params });
export const getTopMentors = () => API.get("/mentorship/mentors/top");
export const getNewMentors = () => API.get("/mentorship/mentors/new");
export const sendMentorshipRequest = (mentorId, data) =>
  API.post(`/mentorship/request/${mentorId}`, data);
export const updateMentorshipStatus = (requestId, status) =>
  API.put(`/mentorship/status/${requestId}?status=${status}`);
export const getMyMentorshipRequests = () => API.get("/mentorship/my-requests");
export const getReceivedRequests = () => API.get("/mentorship/received");
export const becomeMentor = (data) => API.post("/mentorship/become", data);
export const addMentorAvailability = (data) => API.post("/mentorship/availability", data);
export const getMentorAvailability = (mentorId) => API.get(`/mentorship/availability/${mentorId}`);
export const getMyMentorships = () => API.get("/mentorship/my-mentorships");
export const updateMentorshipSessionDetails = (sessionId, data) =>
  API.put(`/mentorship/sessions/${sessionId}/details`, data);
export const completeMentorshipSession = (sessionId) =>
  API.put(`/mentorship/sessions/${sessionId}/complete`);
export const submitMentorshipFeedback = (data) => API.post("/mentorship/feedback", data);
export const getMentorshipDashboard = () => API.get("/mentorship/dashboard");
