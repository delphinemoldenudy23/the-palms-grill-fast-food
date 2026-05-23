import { useEffect, useState } from "react";
import { authApi } from "../lib/api";

export default function SettingsPanel() {
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [createMsg, setCreateMsg] = useState({ type: "", text: "" });
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadProfile();
    loadAdmins();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authApi.get("/api/auth/me");
      setProfile({ username: res.data.username, email: res.data.email });
    } catch {
      setProfileMsg({ type: "error", text: "Could not load profile. Log in again." });
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await authApi.get("/api/auth/admins");
      setAdmins(res.data);
    } catch {
      /* ignore */
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await authApi.put("/api/auth/profile", profile);
      setProfileMsg({ type: "success", text: res.data.message || "Profile updated" });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Update failed",
      });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ type: "error", text: "New passwords do not match" });
    }

    try {
      const res = await authApi.put("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: "success", text: res.data.message });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Password change failed",
      });
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreateMsg({ type: "", text: "" });
    try {
      const res = await authApi.post("/api/auth/create-admin", newAdmin);
      setCreateMsg({ type: "success", text: res.data.message });
      setNewAdmin({ username: "", email: "", password: "", role: "Admin" });
      loadAdmins();
    } catch (err) {
      setCreateMsg({
        type: "error",
        text: err.response?.data?.message || "Could not create admin",
      });
    }
  };

  const Msg = ({ msg }) =>
    msg.text ? (
      <p
        className={`text-sm p-3 rounded-lg mb-4 ${
          msg.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {msg.text}
      </p>
    ) : null;

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-900">
        <strong>Forgot password?</strong> On your computer, open terminal in the{" "}
        <code className="bg-amber-100 px-1 rounded">backend</code> folder and run:{" "}
        <code className="bg-amber-100 px-1 rounded">node resetAdmin.js</code>
        <br />
        That resets <code className="bg-amber-100 px-1 rounded">admin@palmsgrill.com</code> to{" "}
        <code className="bg-amber-100 px-1 rounded">admin123</code>.
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Update login email / username</h3>
        <Msg msg={profileMsg} />
        <form onSubmit={updateProfile} className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <input
            placeholder="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="border p-3 rounded-lg"
            required
          />
          <button
            type="submit"
            className="md:col-span-2 bg-primary text-white py-3 rounded-lg font-bold"
            style={{ backgroundColor: "#FF6B35" }}
          >
            Save profile
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Change password</h3>
        <Msg msg={passwordMsg} />
        <form onSubmit={changePassword} className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
            }
            className="border p-3 rounded-lg md:col-span-2"
            required
          />
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            className="border p-3 rounded-lg"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
            }
            className="border p-3 rounded-lg"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="md:col-span-2 bg-dark text-white py-3 rounded-lg font-bold"
          >
            Change password
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Create new admin account</h3>
        <Msg msg={createMsg} />
        <form onSubmit={createAdmin} className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <input
            placeholder="Username"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            className="border p-3 rounded-lg"
            required
            minLength={6}
          />
          <select
            value={newAdmin.role}
            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            className="border p-3 rounded-lg"
          >
            <option>Admin</option>
            <option>Manager</option>
            <option>SuperAdmin</option>
          </select>
          <button
            type="submit"
            className="md:col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold"
          >
            Create admin
          </button>
        </form>

        {admins.length > 0 && (
          <div className="mt-8">
            <h4 className="font-bold mb-3">Admin accounts</h4>
            <ul className="space-y-2 text-sm">
              {admins.map((a) => (
                <li key={a._id} className="flex justify-between border-b py-2">
                  <span>
                    {a.username} — {a.email}
                  </span>
                  <span className="text-gray-500">{a.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
