import React, { useState, useEffect } from "react";
import SocialCanvas from "./components/SocialCanvas";
import TerminalConsole from "./components/TerminalConsole";
import AlgorithmControls from "./components/AlgorithmControls";
import SettingsModal from "./components/SettingsModal";
import { GraphData } from "./types";
import {
  Users,
  UserPlus,
  Link,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  Terminal as TerminalIcon,
  Zap,
  Globe,
  GitCommit,
  CheckCircle,
  Network,
  Share2,
  Sun,
  Moon,
  LogOut,
  Camera,
  Upload,
  Settings,
  MousePointer,
  Link2,
  Trash2,
} from "lucide-react";

// Inline vector graphic avatars for zero network dependency and high performance
const DEFAULT_AVATARS = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23ec4899'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%2310b981'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='50' fill='%23f59e0b'/><path d='M30,75 C30,60 40,55 50,55 C60,55 70,60 70,75' stroke='white' stroke-width='4' fill='none'/><circle cx='50' cy='35' r='12' fill='white'/></svg>",
];

const APP_TRANSLATIONS = {
  en: {
    // Header
    networkStatus: "Network Status",
    online: "ONLINE // {count} NODES",
    guiMap: "GUI Map",
    cliConsole: "CLI Console",
    
    // Login / Signup Screen
    loginTitle: "Access Social Graph Analyzer",
    loginSubtitle: "Connect and analyze social network graphs.",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter username...",
    emailLabel: "Email Address",
    emailPlaceholder: "alex@example.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+1 (555) 019-2834",
    avatarLabel: "Profile Picture",
    uploadBtn: "Upload Photo",
    chooseAvatar: "Or choose a preset avatar",
    loginBtn: "Access Workspace",
    credentialLabel: "Username, Email or Phone",
    credentialPlaceholder: "Enter username, email or phone...",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    signInBtn: "Sign In",
    signUpBtn: "Sign Up",
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    
    // Main Panel GUI
    friendshipMapTitle: "Friendship Network Map",
    friendshipMapSub: "Interactive physics model. Click on nodes to declare endpoints.",
    startNode: "START:",
    targetNode: "TARGET:",
    dsaTitle: "DSA Mapping & Complexity Specifications",
    networkStorage: "Network Storage",
    adjacencyList: "ADJACENCY LIST",
    shortestPath: "Shortest Path",
    bfsSearch: "BREADTH-FIRST SEARCH",
    communityFinder: "Community Finder",
    recursiveDfs: "RECURSIVE DFS",
    degreeCentrality: "Degree Centrality:",
    mutualFriends: "Mutual Friends:",
    
    // Forms
    editSocialTitle: "Edit Social Network",
    addPersonLabel: "Add Person (Node)",
    addPersonPlaceholder: "Person Name (e.g. Alice)...",
    addPersonBtn: "+ Add Person",
    addFriendshipLabel: "Add Friendship (Bidirectional Edge)",
    from: "-- FROM --",
    to: "-- TO --",
    mapBtn: "Map Friendship (Edge)",
    demoPreset: "Demo Preset",
    resetMap: "Reset Map",
    
    // CLI Help
    cliTitle: "CLI Terminal Guide",
    cliDesc: "This console is linked directly to a running stateful Python subprocess running our core social_graph.py program.",
    cliHelp1: "Type 1 to add people and register them on the graph.",
    cliHelp2: "Type 2 to establish friendships.",
    cliHelp3: "Type 3 to run BFS shortest path trace.",
    cliHelp4: "Type 4 to trigger community detection.",
    cliHelp5: "Type 5 to calculate centrality rankings.",
    cliHelp6: "Type 6 to run set intersection mutual friends.",
    cliSync: "Interactive Sync: Any changes performed in the terminal persist immediately and synchronize onto the GUI map when toggling tabs!",
    
    // Footer
    sysCall: "sys_call: python.analyze_network()",
    logout: "Log Out"
  },
  hi: {
    // Header
    networkStatus: "नेटवर्क स्थिति",
    online: "ऑनलाइन // {count} नोड्स",
    guiMap: "जीयूआई नक्शा",
    cliConsole: "सीएलआई कंसोल",
    
    // Login / Signup Screen
    loginTitle: "सोशल ग्राफ़ एनालाइज़र",
    loginSubtitle: "सामाजिक नेटवर्क ग्राफ़ कनेक्ट करें और विश्लेषण करें।",
    usernameLabel: "उपयोगकर्ता नाम",
    usernamePlaceholder: "उपयोगकर्ता नाम दर्ज करें...",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "alex@example.com",
    phoneLabel: "फ़ोन नंबर",
    phonePlaceholder: "+91 98765 43210",
    avatarLabel: "प्रोफ़ाइल चित्र",
    uploadBtn: "कस्टम फोटो",
    chooseAvatar: "या एक प्रीसेट अवतार चुनें",
    loginBtn: "एक्सेस वर्कस्पेस",
    credentialLabel: "उपयोगकर्ता नाम, ईमेल या फोन",
    credentialPlaceholder: "उपयोगकर्ता नाम, ईमेल या फोन दर्ज करें...",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    signInBtn: "साइन इन करें",
    signUpBtn: "साइन अप करें",
    noAccount: "खाता नहीं है? ",
    hasAccount: "पहले से ही खाता है? ",
    
    // Main Panel GUI
    friendshipMapTitle: "मित्रता नेटवर्क मानचित्र",
    friendshipMapSub: "इंटरैक्टिव भौतिकी मॉडल। समापन बिंदु घोषित करने के लिए नोड्स पर क्लिक करें।",
    startNode: "प्रारंभ:",
    targetNode: "लक्ष्य:",
    dsaTitle: "डीएसए मैपिंग और जटिलता विशिष्टताएं",
    networkStorage: "नेटवर्क स्टोरेज",
    adjacencyList: "आसन्नता सूची",
    shortestPath: "सबसे छोटा पथ",
    bfsSearch: "बीएफएस सर्च",
    communityFinder: "समुदाय खोजक",
    recursiveDfs: "डीएफएस रिकर्सन",
    degreeCentrality: "डिग्री केंद्रीयता:",
    mutualFriends: "आपसी मित्र:",
    
    // Forms
    editSocialTitle: "सोशल नेटवर्क संपादित करें",
    addPersonLabel: "व्यक्ति जोड़ें (नोड)",
    addPersonPlaceholder: "व्यक्ति का नाम (उदा. एलिस)...",
    addPersonBtn: "+ व्यक्ति जोड़ें",
    addFriendshipLabel: "मित्रता जोड़ें (द्विदिश किनारा)",
    from: "-- से --",
    to: "-- तक --",
    mapBtn: "मित्रता मैप करें (किनारा)",
    demoPreset: "डेमो प्रीसेट लोड करें",
    resetMap: "मानचित्र रीसेट करें",
    
    // CLI Help
    cliTitle: "सीएलआई टर्मिनल गाइड",
    cliDesc: "यह कंसोल सीधे हमारे कोर social_graph.py प्रोग्राम को चलाने वाले स्टेटफुल पायथन सबप्रोसेस से जुड़ा हुआ है।",
    cliHelp1: "लोगों को जोड़ने और उन्हें ग्राफ़ पर पंजीकृत करने के लिए 1 टाइप करें।",
    cliHelp2: "मित्रता स्थापित करने के लिए 2 टाइप करें।",
    cliHelp3: "बीएफएस सबसे छोटे पथ का पता लगाने के लिए 3 टाइप करें।",
    cliHelp4: "सामुदायिक पहचान को ट्रिगर करने के लिए 4 टाइप करें।",
    cliHelp5: "केंद्रीयता रैंकिंग की गणना करने के लिए 5 टाइप करें।",
    cliHelp6: "आपसी मित्रों को खोजने के लिए 6 टाइप करें।",
    cliSync: "इंटरैक्टिव सिंक: टर्मिनल में किए गए कोई भी बदलाव तुरंत सहेजे जाते हैं और टैब टॉगल करते समय जीयूआई मैप पर सिंक हो जाते हैं!",
    
    // Footer
    sysCall: "sys_call: python.analyze_network()",
    logout: "लॉग आउट"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"gui" | "terminal">("gui");
  
  // Graph Data
  const [graphData, setGraphData] = useState<GraphData>({ users: [], graph: {} });
  
  // Form Inputs
  const [newUsername, setNewUsername] = useState("");
  const [friend1, setFriend1] = useState("");
  const [friend2, setFriend2] = useState("");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Theme & Language
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("app-theme") as "light" | "dark") || "dark";
  });
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("app-language") as "en" | "hi") || "en";
  });

  // Login session
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("is-logged-in") === "true";
  });
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
    phone: string;
    avatarUrl: string;
  } | null>(() => {
    const saved = localStorage.getItem("current-user");
    return saved ? JSON.parse(saved) : null;
  });

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auth form inputs
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [loginCredential, setLoginCredential] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form inputs
  const [loginUsername, setLoginUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginAvatar, setLoginAvatar] = useState(DEFAULT_AVATARS[0]);

  // Forgot Password form inputs
  const [forgotCredential, setForgotCredential] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  // Handle setting theme with persistence
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("app-theme", next);
  };

  // Handle setting language with persistence
  const handleSetLanguage = (lang: "en" | "hi") => {
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
  };

  // Handle Login submission via backend
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCredential.trim() || !loginPassword.trim()) return;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: loginCredential.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem("current-user", JSON.stringify(data.user));
        setFormMsg({ type: "success", text: `Welcome back, ${data.user.username}!` });
      } else {
        alert(data.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      alert("Error logging in. Server might be offline.");
    }
  };

  // Handle Signup submission via backend
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginEmail.trim() || !loginPhone.trim() || !loginPassword.trim()) return;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          email: loginEmail.trim(),
          phone: loginPhone.trim(),
          password: loginPassword,
          avatarUrl: loginAvatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem("current-user", JSON.stringify(data.user));
        setFormMsg({ type: "success", text: "Account created successfully! Welcome." });
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (err) {
      alert("Error signing up. Server might be offline.");
    }
  };

  // Handle Forgot Password submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCredential.trim() || !forgotNewPassword.trim() || !forgotConfirmPassword.trim()) {
      alert(language === "hi" ? "कृपया सभी फ़ील्ड भरें।" : "Please fill in all fields.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      alert(language === "hi" ? "पासवर्ड मेल नहीं खाते!" : "Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: forgotCredential.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Clean up inputs and switch back to login mode
        setForgotCredential("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setAuthMode("login");
      } else {
        alert(data.message || (language === "hi" ? "पासवर्ड रीसेट करने में विफल।" : "Failed to reset password."));
      }
    } catch (err) {
      alert(language === "hi" ? "पासवर्ड रीसेट करने में त्रुटि।" : "Error resetting password. Server might be offline.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("is-logged-in");
    localStorage.removeItem("current-user");
    // Clear inputs
    setLoginCredential("");
    setLoginPassword("");
    setLoginUsername("");
    setLoginEmail("");
    setLoginPhone("");
  };

  // Handle custom picture upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLoginAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trace overlays for Canvas
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [queueNodes, setQueueNodes] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [communities, setCommunities] = useState<string[][]>([]);

  // Canvas interaction selection states
  const [selectedStartNode, setSelectedStartNode] = useState<string | null>(null);
  const [selectedEndNode, setSelectedEndNode] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<"select" | "add_person" | "create_friendship" | "eraser">("select");

  // Fetch full graph state
  const fetchGraph = async () => {
    try {
      const res = await fetch("/api/graph");
      const data = await res.json();
      setGraphData({
        users: data.users || [],
        graph: data.graph || {},
      });
    } catch (err) {
      console.error("Failed to fetch graph data", err);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Sync canvas nodes selections
  const handleSelectNodeFromCanvas = (username: string) => {
    if (!selectedStartNode) {
      setSelectedStartNode(username);
    } else if (!selectedEndNode && selectedStartNode !== username) {
      setSelectedEndNode(username);
    } else {
      setSelectedStartNode(username);
      setSelectedEndNode(null);
    }
  };

  // Inline graph manipulators for the interactive canvas modes
  const handleAddUserInline = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setGraphData({ users: data.users || [], graph: data.graph || {} });
        return true;
      } else {
        alert(data.message || "Failed to add person.");
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAddFriendshipInline = async (user1: string, user2: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/friendship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user1, user2 }),
      });
      const data = await res.json();
      if (data.success) {
        setGraphData({ users: data.users || [], graph: data.graph || {} });
        return true;
      } else {
        alert(data.message || "Failed to establish friendship.");
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteUserInline = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setGraphData({ users: data.users || [], graph: data.graph || {} });
        // Clear selection states if we deleted the node
        if (selectedStartNode === username) setSelectedStartNode(null);
        if (selectedEndNode === username) setSelectedEndNode(null);
        if (activeNode === username) setActiveNode(null);
        return true;
      } else {
        alert(data.message || "Failed to delete person.");
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteFriendshipInline = async (user1: string, user2: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/friendship", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user1, user2 }),
      });
      const data = await res.json();
      if (data.success) {
        setGraphData({ users: data.users || [], graph: data.graph || {} });
        return true;
      } else {
        alert(data.message || "Failed to delete friendship.");
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setFormMsg(null);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ type: "success", text: data.message });
        setNewUsername("");
        setGraphData({ users: data.users || [], graph: data.graph || {} });
      } else {
        setFormMsg({ type: "error", text: data.message });
      }
    } catch (err) {
      setFormMsg({ type: "error", text: "Failed to connect to backend server." });
    }
  };

  // Add Friendship
  const handleAddFriendship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend1 || !friend2) return;
    setFormMsg(null);

    try {
      const res = await fetch("/api/friendship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user1: friend1, user2: friend2 }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ type: "success", text: data.message });
        setFriend1("");
        setFriend2("");
        setGraphData({ users: data.users || [], graph: data.graph || {} });
      } else {
        setFormMsg({ type: "error", text: data.message });
      }
    } catch (err) {
      setFormMsg({ type: "error", text: "Failed to connect to backend server." });
    }
  };

  // Clear Network
  const handleResetGraph = async () => {
    if (!confirm("Are you sure you want to delete all users and friendships from the network?")) return;
    setFormMsg(null);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      setGraphData({ users: [], graph: {} });
      setSelectedStartNode(null);
      setSelectedEndNode(null);
      setFormMsg({ type: "success", text: data.message });
    } catch (err) {
      setFormMsg({ type: "error", text: "Reset failed." });
    }
  };

  // Load Demo Preset
  const handleLoadPreset = async () => {
    setFormMsg(null);
    try {
      const res = await fetch("/api/load_preset", { method: "POST" });
      const data = await res.json();
      setGraphData({ users: data.users || [], graph: data.graph || {} });
      setSelectedStartNode(null);
      setSelectedEndNode(null);
      setFormMsg({ type: "success", text: data.message });
    } catch (err) {
      setFormMsg({ type: "error", text: "Preset load failed." });
    }
  };

  // Clear Canvas Selections
  const clearSelections = () => {
    setSelectedStartNode(null);
    setSelectedEndNode(null);
  };

  // Dynamic Trace Update Callback
  const handleTraceUpdate = (
    active: string | null,
    queue: string[],
    visited: string[],
    path: string[],
    comps: string[][]
  ) => {
    setActiveNode(active);
    setQueueNodes(queue);
    setVisitedNodes(visited);
    setHighlightedPath(path);
    setCommunities(comps);
  };

  if (!isLoggedIn) {
    const t = APP_TRANSLATIONS[language];
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-300 ${
        theme === "light" ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-slate-200"
      }`}>
        {/* Floating Utility Controls (Language & Theme) */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {/* Language toggle */}
          <div className={`flex items-center gap-1 p-1 rounded border ${
            theme === "light" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
          }`}>
            <button
              onClick={() => handleSetLanguage("en")}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                language === "en"
                  ? "bg-indigo-600 text-white shadow"
                  : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleSetLanguage("hi")}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-indigo-600 text-white shadow"
                  : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              हिं
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded border transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
            title={theme === "light" ? "Dark Mode" : "Light Mode"}
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        {/* Login Card Container */}
        <div className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl transition-all duration-300 ${
          theme === "light" ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-850"
        }`}>
          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20 mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
                <Network size={22} className="animate-pulse" />
              </div>
            </div>
            <h1 className={`text-lg font-black tracking-widest uppercase ${theme === "light" ? "text-slate-900" : "text-white"}`}>
              Social Graph Analyzer
            </h1>
            <p className={`text-[11px] mt-1.5 font-sans leading-relaxed max-w-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form container - toggled between Login & Signup & Forgot */}
          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Credential Field (username/email/phone) */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.credentialLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.credentialPlaceholder}
                  value={loginCredential}
                  onChange={(e) => setLoginCredential(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                    {t.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("forgot"); }}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 cursor-pointer hover:underline transition-colors"
                  >
                    {language === "hi" ? "पासवर्ड भूल गए?" : "Forgot Password?"}
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer shadow-lg shadow-indigo-600/10 mt-6"
              >
                <span>{t.signInBtn}</span>
              </button>

              <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800/60 mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setLoginPassword(""); }}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                >
                  {t.noAccount} <span className="underline">{t.signUpBtn}</span>
                </button>
              </div>
            </form>
          ) : authMode === "signup" ? (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.usernameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.usernamePlaceholder}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Phone Number Input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t.phonePlaceholder}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Avatar Picker & Upload Block */}
              <div className="space-y-2 pt-1">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.avatarLabel}
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Current Avatar Circle */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-950 flex-shrink-0">
                    <img src={loginAvatar} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className={`flex items-center gap-2 px-2.5 py-1 border rounded-md text-[11px] font-bold transition-all cursor-pointer w-fit ${
                      theme === "light"
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}>
                      <Camera size={12} />
                      <span>{t.uploadBtn}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Avatar Selection Grid */}
                <div className="space-y-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                    {t.chooseAvatar}
                  </span>
                  <div className="flex gap-1.5">
                    {DEFAULT_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLoginAvatar(avatar)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                          loginAvatar === avatar ? "border-indigo-500 scale-105 ring-2 ring-indigo-500/20" : "border-transparent"
                        }`}
                      >
                        <img src={avatar} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signup Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider py-2 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer shadow-lg shadow-indigo-600/10 mt-4"
              >
                <span>{t.signUpBtn}</span>
              </button>

              <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800/60 mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setLoginPassword(""); }}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                >
                  {t.hasAccount} <span className="underline">{t.signInBtn}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="text-center">
                <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                  {language === "hi" ? "पासवर्ड भूल गए?" : "Forgot Password?"}
                </h2>
                <p className={`text-[11px] mb-4 leading-relaxed ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {language === "hi"
                    ? "अपना पंजीकृत उपयोगकर्ता नाम, ईमेल या फ़ोन दर्ज करें और एक नया पासवर्ड सेट करें।"
                    : "Enter your registered username, email, or phone number and set a new password."}
                </p>
              </div>

              {/* Account Credential input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {language === "hi" ? "पंजीकृत उपयोगकर्ता नाम, ईमेल या फ़ोन" : "Registered Username, Email or Phone"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "hi" ? "दर्ज करें..." : "Enter registered credential..."}
                  value={forgotCredential}
                  onChange={(e) => setForgotCredential(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* New Password input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {language === "hi" ? "नया पासवर्ड" : "New Password"}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              {/* Confirm New Password input */}
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {language === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer shadow-lg shadow-indigo-600/10 mt-6"
              >
                <span>{language === "hi" ? "पासवर्ड बदलें" : "Reset Password"}</span>
              </button>

              <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800/60 mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); }}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                >
                  <span className="underline">{language === "hi" ? "लॉगिन पर वापस जाएं" : "Back to Login"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const t = APP_TRANSLATIONS[language];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === "light" ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-slate-200"
    }`}>
      {/* Dynamic Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
        theme === "light" ? "bg-white/90 border-slate-200" : "bg-slate-900/50 border-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center text-indigo-400">
                <Network size={18} className="animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div>
              <h1 className={`text-sm font-black tracking-widest uppercase flex items-center gap-2 ${
                theme === "light" ? "text-slate-900" : "text-white"
              }`}>
                SOCIAL GRAPH ANALYZER
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Network Status widget */}
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-xl ${
              theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-850"
            }`}>
              <div className="flex items-center justify-center text-indigo-500">
                <Users size={14} />
              </div>
              <div className="text-left leading-none">
                <div className={`text-[9px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {t.networkStatus}
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {graphData.users.length} {language === "hi" ? "नोड्स" : "NODES"}
                </div>
              </div>
            </div>

            {/* User Profile Info Card in Header */}
            {currentUser && (
              <div className={`flex items-center gap-2.5 px-3 py-1 border rounded-xl ${
                theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-850"
              }`}>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500 bg-slate-950">
                  <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left leading-none font-sans hidden sm:block">
                  <div className={`text-[11px] font-bold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{currentUser.username}</div>
                </div>
              </div>
            )}

            {/* Language Selection */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded border ${
              theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
            }`}>
              <button
                onClick={() => handleSetLanguage("en")}
                className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-indigo-600 text-white shadow"
                    : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-250"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleSetLanguage("hi")}
                className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                  language === "hi"
                    ? "bg-indigo-600 text-white shadow"
                    : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-250"
                }`}
              >
                हिं
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
              title={theme === "light" ? "Dark Mode" : "Light Mode"}
            >
              {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
              title={language === "hi" ? "खाता सेटिंग" : "Account Settings"}
            >
              <Settings size={13} />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                theme === "light"
                  ? "bg-white border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                  : "bg-slate-950 border-slate-800 text-red-400 hover:bg-red-950/20 hover:border-red-900/40"
              }`}
              title={t.logout}
            >
              <LogOut size={13} />
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-850 hidden md:block"></div>

            {/* Navigation Mode Tabs */}
            <div className={`flex p-1 rounded border ${
              theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-900/80 border-slate-800"
            }`}>
              <button
                onClick={() => setActiveTab("gui")}
                className={`flex items-center gap-1.5 py-1 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeTab === "gui"
                    ? "bg-indigo-600 text-white shadow"
                    : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-250"
                }`}
              >
                <LayoutGrid size={11} />
                <span>{t.guiMap}</span>
              </button>
              <button
                onClick={() => setActiveTab("terminal")}
                className={`flex items-center gap-1.5 py-1 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-indigo-600 text-white shadow"
                    : theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-250"
                }`}
              >
                <TerminalIcon size={11} />
                <span>{t.cliConsole}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Quick notification bar */}
        {formMsg && (
          <div
            className={`px-4 py-3 border text-xs font-mono tracking-wide animate-fade-in flex items-center justify-between uppercase ${
              formMsg.type === "success"
                ? theme === "light" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                : theme === "light" ? "bg-red-50 border-red-200 text-red-700" : "bg-red-950/30 border-red-500/30 text-red-400"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle size={14} />
              <span>{formMsg.text}</span>
            </span>
            <button onClick={() => setFormMsg(null)} className="opacity-60 hover:opacity-100 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {activeTab === "gui" ? (
          /* ========================================================
             GUI INTERACTIVE VIEW
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Visual Canvas Panel (Left Column) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Canvas Mode Select Toolbar */}
              <div className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 ${
                theme === "light" ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/30 border-slate-800"
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                    theme === "light" ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {language === "hi" ? "कैनवास मोड:" : "CANVAS MODE:"}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setCanvasMode("select")}
                      className={`flex items-center gap-1.5 py-1.5 px-3.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        canvasMode === "select"
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : theme === "light"
                            ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <MousePointer size={11} />
                      <span>{language === "hi" ? "चुनें / खींचें" : "SELECT / DRAG"}</span>
                    </button>

                    <button
                      onClick={() => setCanvasMode("add_person")}
                      className={`flex items-center gap-1.5 py-1.5 px-3.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        canvasMode === "add_person"
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : theme === "light"
                            ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <UserPlus size={11} />
                      <span>{language === "hi" ? "व्यक्ति जोड़ें" : "ADD PERSON"}</span>
                    </button>

                    <button
                      onClick={() => setCanvasMode("create_friendship")}
                      className={`flex items-center gap-1.5 py-1.5 px-3.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        canvasMode === "create_friendship"
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : theme === "light"
                            ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Link2 size={11} />
                      <span>{language === "hi" ? "मित्रता बनाएं" : "CREATE FRIENDSHIP"}</span>
                    </button>

                    <button
                      onClick={() => setCanvasMode("eraser")}
                      className={`flex items-center gap-1.5 py-1.5 px-3.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        canvasMode === "eraser"
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : theme === "light"
                            ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Trash2 size={11} />
                      <span>{language === "hi" ? "इरेज़र टूल" : "ERASER TOOL"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`border rounded p-5 flex flex-col gap-3 ${
                theme === "light" ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-800"
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${
                  theme === "light" ? "border-slate-100" : "border-slate-850"
                }`}>
                  <div>
                    <h2 className={`text-xs font-bold tracking-wider uppercase ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                      {t.friendshipMapTitle}
                    </h2>
                    <p className={`text-[10px] font-mono uppercase tracking-tight ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                      {t.friendshipMapSub}
                    </p>
                  </div>
                  
                  {/* Selection Status HUD */}
                  {(selectedStartNode || selectedEndNode) && (
                    <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded text-[10px] font-mono ${
                      theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800"
                    }`}>
                      {selectedStartNode && (
                        <span className="text-indigo-500 font-bold">{t.startNode} {selectedStartNode}</span>
                      )}
                      {selectedStartNode && selectedEndNode && <span className="text-slate-300 dark:text-slate-700">|</span>}
                      {selectedEndNode && (
                        <span className="text-amber-500 font-bold">{t.targetNode} {selectedEndNode}</span>
                      )}
                      <button onClick={clearSelections} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-1.5 font-bold">✕</button>
                    </div>
                  )}
                </div>

                <SocialCanvas
                  users={graphData.users}
                  graph={graphData.graph}
                  activeNode={activeNode}
                  queueNodes={queueNodes}
                  visitedNodes={visitedNodes}
                  highlightedPath={highlightedPath}
                  communities={communities}
                  onSelectNode={handleSelectNodeFromCanvas}
                  selectedStart={selectedStartNode}
                  selectedEnd={selectedEndNode}
                  theme={theme}
                  language={language}
                  canvasMode={canvasMode}
                  onAddUserInline={handleAddUserInline}
                  onAddFriendshipInline={handleAddFriendshipInline}
                  onDeleteUserInline={handleDeleteUserInline}
                  onDeleteFriendshipInline={handleDeleteFriendshipInline}
                />
              </div>

              {/* Data Structure & Mapping Panel */}
              <div className={`border rounded p-5 space-y-4 ${
                theme === "light" ? "bg-white border-slate-200" : "bg-slate-900/20 border-slate-800"
              }`}>
                <div className={`flex items-center gap-2 border-b pb-3 ${
                  theme === "light" ? "border-slate-100 text-slate-900" : "border-slate-850 text-white"
                }`}>
                  <BookOpen size={14} className="text-indigo-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">{t.dsaTitle}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className={`space-y-1 p-3 border rounded ${
                    theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-900/50 border-slate-800 text-slate-300"
                  }`}>
                    <span className="font-bold text-slate-500 text-[9px] uppercase tracking-widest block">{t.networkStorage}</span>
                    <span className="font-bold block text-xs">{t.adjacencyList}</span>
                    <span className="text-[10px] text-indigo-500 block font-semibold">defaultdict(list)</span>
                    <span className="text-[9px] text-slate-500">LOOKUP TIME: O(1)</span>
                  </div>

                  <div className={`space-y-1 p-3 border rounded ${
                    theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-900/50 border-slate-800 text-slate-300"
                  }`}>
                    <span className="font-bold text-slate-500 text-[9px] uppercase tracking-widest block">{t.shortestPath}</span>
                    <span className="font-bold block text-xs">{t.bfsSearch}</span>
                    <span className="text-[10px] text-blue-500 block font-semibold">collections.deque</span>
                    <span className="text-[9px] text-slate-500">COMPLEXITY: O(V + E)</span>
                  </div>

                  <div className={`space-y-1 p-3 border rounded ${
                    theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-900/50 border-slate-800 text-slate-300"
                  }`}>
                    <span className="font-bold text-slate-500 text-[9px] uppercase tracking-widest block">{t.communityFinder}</span>
                    <span className="font-bold block text-xs">{t.recursiveDfs}</span>
                    <span className="text-[10px] text-emerald-500 block font-semibold">Stack Recursion</span>
                    <span className="text-[9px] text-slate-500">COMPLEXITY: O(V + E)</span>
                  </div>
                </div>

                <div className={`flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-[10px] font-mono uppercase tracking-wider ${
                  theme === "light" ? "border-slate-100 text-slate-500" : "border-slate-850 text-slate-500"
                }`}>
                  <div className="flex items-center gap-1.5">
                    <GitCommit size={11} className="text-purple-500" />
                    <span>{t.degreeCentrality} <strong className={theme === "light" ? "text-slate-700" : "text-slate-300"}>sorted() + lambda</strong> (O(N log N))</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={11} className="text-emerald-500" />
                    <span>{t.mutualFriends} <strong className={theme === "light" ? "text-slate-700" : "text-slate-300"}>set.intersection()</strong> (O(min(A, B)))</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel (Right Column) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Creator Forms */}
              <div className={`border rounded p-5 space-y-5 ${
                theme === "light" ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-800"
              }`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider border-b pb-2.5 ${
                  theme === "light" ? "border-slate-100 text-slate-900" : "border-slate-850 text-white"
                }`}>{t.editSocialTitle}</h3>
                
                {/* Add Node Form */}
                <form onSubmit={handleAddUser} className="space-y-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.addPersonLabel}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.addPersonPlaceholder}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className={`flex-1 border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                        theme === "light" ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!newUsername.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                    >
                      <span>{t.addPersonBtn}</span>
                    </button>
                  </div>
                </form>

                {/* Add Edge Form */}
                <form onSubmit={handleAddFriendship} className={`space-y-3 pt-2 border-t ${
                  theme === "light" ? "border-slate-100" : "border-slate-850"
                }`}>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.addFriendshipLabel}</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={friend1}
                      onChange={(e) => setFriend1(e.target.value)}
                      className={`border rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                        theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-305"
                      }`}
                    >
                      <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.from}</option>
                      {graphData.users.map((u) => (
                        <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                      ))}
                    </select>

                    <select
                      value={friend2}
                      onChange={(e) => setFriend2(e.target.value)}
                      className={`border rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                        theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-305"
                      }`}
                    >
                      <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.to}</option>
                      {graphData.users.map((u) => (
                        <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!friend1 || !friend2 || friend1 === friend2}
                    className={`w-full border font-bold py-2 rounded text-xs tracking-wider transition-all uppercase italic cursor-pointer ${
                      theme === "light"
                        ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                        : "bg-indigo-900/30 hover:bg-indigo-900/50 border-indigo-700/50 text-indigo-300"
                    }`}
                  >
                    <span>{t.mapBtn}</span>
                  </button>
                </form>

                {/* System actions (Presets and Reset) */}
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${
                  theme === "light" ? "border-slate-100" : "border-slate-850"
                }`}>
                  <button
                    onClick={handleLoadPreset}
                    className={`py-1.5 px-3 border font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer ${
                      theme === "light"
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                    }`}
                  >
                    <Globe size={12} className="text-slate-400" />
                    <span>{t.demoPreset}</span>
                  </button>
                  <button
                    onClick={handleResetGraph}
                    className="py-1.5 px-3 bg-red-900/10 hover:bg-red-900/20 border border-red-500/20 text-red-500 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>{t.resetMap}</span>
                  </button>
                </div>
              </div>

              {/* Algorithms Control Center */}
              <AlgorithmControls
                users={graphData.users}
                graph={graphData.graph}
                onTraceUpdate={handleTraceUpdate}
                selectedStartNode={selectedStartNode}
                selectedEndNode={selectedEndNode}
                theme={theme}
                language={language}
              />
            </div>
          </div>
        ) : (
          /* ========================================================
             TERMINAL CONSOLE VIEW
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <TerminalConsole onGraphUpdated={fetchGraph} theme={theme} language={language} />
            </div>

            {/* Helper Instructions Side Panel */}
            <div className={`border rounded p-5 space-y-4 font-mono ${
              theme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900/20 border-slate-800 text-slate-300"
            }`}>
              <h3 className={`font-bold text-xs uppercase tracking-wider border-b pb-2.5 ${
                theme === "light" ? "border-slate-100 text-slate-900" : "border-slate-850 text-white"
              }`}>
                {t.cliTitle}
              </h3>
              
              <p className={`text-[11px] leading-relaxed ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                {t.cliDesc}
              </p>

              <div className={`space-y-2.5 text-[11px] ${theme === "light" ? "text-slate-650" : "text-slate-350"}`}>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">1.</span>
                  <span>{t.cliHelp1}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">2.</span>
                  <span>{t.cliHelp2}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">3.</span>
                  <span>{t.cliHelp3}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">4.</span>
                  <span>{t.cliHelp4}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">5.</span>
                  <span>{t.cliHelp5}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-500">6.</span>
                  <span>{t.cliHelp6}</span>
                </div>
              </div>

              <div className={`border rounded p-3 text-[10px] leading-relaxed uppercase ${
                theme === "light" ? "bg-amber-50 border-amber-200 text-amber-800 animate-pulse" : "bg-amber-950/20 border-amber-900/30 text-amber-300"
              }`}>
                🎯 {t.cliSync}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`h-10 border-t flex items-center px-6 justify-between flex-shrink-0 mt-12 select-none ${
        theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
      }`}>
        <div className="flex gap-4">
          <span className={`text-[9px] font-mono ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>{t.sysCall}</span>
        </div>
      </footer>

      {/* Account Settings Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem("current-user", JSON.stringify(updatedUser));
        }}
        theme={theme}
        language={language}
      />
    </div>
  );
}
