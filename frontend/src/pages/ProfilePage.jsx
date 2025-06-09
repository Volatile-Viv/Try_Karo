import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProfilePage = () => {
  const { user, updateProfile, updatePassword, loading, error, clearError } =
    useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [activeTab, setActiveTab] = useState("profile");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Handle profile form changes
  const handleProfileChange = (e) => {
    clearError();
    setProfileSuccess(false);
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    clearError();
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(profileData);
    if (success) {
      setProfileSuccess(true);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    const success = await updatePassword({ currentPassword, newPassword });
    if (success) {
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  if (!user) return <Loader />;

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "Brand":
        return "Product Brand";
      case "User":
        return "Product User/Tester";
      case "admin":
        return "Administrator";
      default:
        return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={user.avatar || "https://via.placeholder.com/150?text=Avatar"}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              />
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {getRoleDisplayName(user.role)}
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="text-sm uppercase text-gray-500 font-semibold mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {user.bio || "No bio information provided yet. Edit your profile to add a bio."}
              </p>
            </div>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
                {user.role === "User" && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Tester
                  </div>
                )}
                {user.role === "Brand" && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Brand Account
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("profile")}
            className={`mr-8 py-4 px-1 ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`py-4 px-1 ${
              activeTab === "password"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Change Password
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md border border-green-200">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      profileData.avatar ||
                      "https://via.placeholder.com/150?text=Avatar"
                    }
                    alt={profileData.name}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="avatar"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={profileData.avatar}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a URL for your profile picture
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md border border-green-200">
              Password updated successfully!
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`form-input ${
                  passwordError ? "border-red-500" : ""
                }`}
                required
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
