import express from "express";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "users.json");

export interface RegisteredUser {
  username: string;
  email: string;
  phone: string;
  password?: string;
  avatarUrl: string;
}

// Ensure database file exists and contains at least a default test account
function initializeUsersDB() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers: RegisteredUser[] = [
      {
        username: "alice",
        email: "alice@example.com",
        phone: "+1 (555) 019-2834",
        password: "password123",
        avatarUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
      },
      {
        username: "bob",
        email: "bob@example.com",
        phone: "+1 (555) 987-6543",
        password: "password123",
        avatarUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ec4899'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
  }
}

// Load registered users from JSON file
export function loadUsers(): RegisteredUser[] {
  initializeUsersDB();
  try {
    const content = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(content) as RegisteredUser[];
  } catch (err) {
    console.error("Error reading users database, resetting.", err);
    return [];
  }
}

// Save registered users to JSON file
export function saveUsers(users: RegisteredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to users database", err);
  }
}

const authRouter = express.Router();

// Signup Route
authRouter.post("/signup", (req, res) => {
  const { username, email, phone, password, avatarUrl } = req.body;

  if (!username || !email || !phone || !password) {
    res.status(400).json({ success: false, message: "All fields are required for signup." });
    return;
  }

  const users = loadUsers();
  
  // Check duplication
  const lowerUser = username.toLowerCase().trim();
  const lowerEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();

  const userExists = users.some(
    (u) =>
      u.username.toLowerCase() === lowerUser ||
      u.email.toLowerCase() === lowerEmail ||
      u.phone === cleanPhone
  );

  if (userExists) {
    res.status(400).json({
      success: false,
      message: "An account with this username, email, or phone number already exists.",
    });
    return;
  }

  const newUser: RegisteredUser = {
    username: username.trim(),
    email: email.trim(),
    phone: cleanPhone,
    password, // Store as is for demonstration/prototyping
    avatarUrl: avatarUrl || "",
  };

  users.push(newUser);
  saveUsers(users);

  // Return the user without the password field
  const { password: _, ...userSafe } = newUser;
  res.json({ success: true, message: "Signup successful!", user: userSafe });
});

// Login Route
authRouter.post("/login", (req, res) => {
  const { credential, password } = req.body;

  if (!credential || !password) {
    res.status(400).json({ success: false, message: "Credential and password are required." });
    return;
  }

  const users = loadUsers();
  const searchCred = credential.toLowerCase().trim();

  const user = users.find(
    (u) =>
      u.username.toLowerCase() === searchCred ||
      u.email.toLowerCase() === searchCred ||
      u.phone.trim() === credential.trim()
  );

  if (!user || user.password !== password) {
    res.status(400).json({ success: false, message: "Invalid credentials or password." });
    return;
  }

  const { password: _, ...userSafe } = user;
  res.json({ success: true, message: "Login successful!", user: userSafe });
});

// Update Profile Route
authRouter.post("/update", (req, res) => {
  const { oldUsername, username, email, phone, password, avatarUrl } = req.body;

  if (!oldUsername) {
    res.status(400).json({ success: false, message: "Current user context is missing." });
    return;
  }

  const users = loadUsers();
  const userIdx = users.findIndex((u) => u.username.toLowerCase() === oldUsername.toLowerCase().trim());

  if (userIdx === -1) {
    res.status(404).json({ success: false, message: "User account not found on server." });
    return;
  }

  // If changing credentials, check that they aren't taken by someone else
  const newLowerUser = username ? username.toLowerCase().trim() : "";
  const newLowerEmail = email ? email.toLowerCase().trim() : "";
  const newCleanPhone = phone ? phone.trim() : "";

  for (let i = 0; i < users.length; i++) {
    if (i === userIdx) continue;
    const other = users[i];
    if (newLowerUser && other.username.toLowerCase() === newLowerUser) {
      res.status(400).json({ success: false, message: "Username is already taken by another account." });
      return;
    }
    if (newLowerEmail && other.email.toLowerCase() === newLowerEmail) {
      res.status(400).json({ success: false, message: "Email is already in use by another account." });
      return;
    }
    if (newCleanPhone && other.phone === newCleanPhone) {
      res.status(400).json({ success: false, message: "Phone number is already associated with another account." });
      return;
    }
  }

  const targetUser = users[userIdx];
  if (username) targetUser.username = username.trim();
  if (email) targetUser.email = email.trim();
  if (phone) targetUser.phone = newCleanPhone;
  if (password) targetUser.password = password;
  if (avatarUrl) targetUser.avatarUrl = avatarUrl;

  saveUsers(users);

  const { password: _, ...userSafe } = targetUser;
  res.json({ success: true, message: "Profile updated successfully!", user: userSafe });
});

// Forgot Password / Reset Route
authRouter.post("/forgot-password", (req, res) => {
  const { credential, newPassword } = req.body;

  if (!credential || !newPassword) {
    res.status(400).json({ success: false, message: "Both account credential and new password are required." });
    return;
  }

  const users = loadUsers();
  const searchCred = credential.toLowerCase().trim();

  const userIdx = users.findIndex(
    (u) =>
      u.username.toLowerCase() === searchCred ||
      u.email.toLowerCase() === searchCred ||
      u.phone.trim() === credential.trim()
  );

  if (userIdx === -1) {
    res.status(404).json({
      success: false,
      message: "No registered account found with that username, email, or phone number.",
    });
    return;
  }

  users[userIdx].password = newPassword;
  saveUsers(users);

  res.json({
    success: true,
    message: "Password reset completed successfully! You can now log in with your new password.",
  });
});

export default authRouter;
