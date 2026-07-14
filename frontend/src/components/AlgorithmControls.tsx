import { useState, useEffect } from "react";
import { AlgorithmStep, CentralityRanking } from "../types";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Award, Users, Search, HelpCircle, AlertCircle } from "lucide-react";

// Community color palette matching SocialCanvas
const COMMUNITY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

interface AlgorithmControlsProps {
  users: string[];
  graph: Record<string, string[]>;
  onTraceUpdate: (
    activeNode: string | null,
    queueNodes: string[],
    visitedNodes: string[],
    path: string[],
    communities: string[][]
  ) => void;
  selectedStartNode: string | null;
  selectedEndNode: string | null;
  theme?: "light" | "dark";
  language?: "en" | "hi";
}

type Mode = "idle" | "bfs" | "dfs" | "centrality" | "mutual";

// Detailed translation dictionary for both English and Hindi languages
const ALGO_TRANSLATIONS = {
  en: {
    bfsPath: "BFS Path",
    dfsComms: "DFS Comms",
    centrality: "Centrality",
    mutual: "Mutual",
    selectAlgo: "Select an Algorithm",
    chooseTab: "Choose a tab above to configure and visualize graph algorithms running on our Python backend.",
    bfsDesc: "BFS Mapping Logic: Explores level-by-level using a FIFO queue (collections.deque) to find the shortest friendship path in O(V + E) time.",
    startPerson: "Start Person",
    targetPerson: "Target Person",
    selectStart: "-- Select Start --",
    selectTarget: "-- Select Target --",
    findShortestPath: "Find Shortest Friendship Path",
    dfsDesc: "DFS Community Detection: Uses recursive backtracking and a set() visited tracker on the Python backend to group connected subgraphs into isolated communities.",
    detectCommunities: "Detect Friend Communities",
    bfsSim: "BFS Path Simulation",
    dfsSim: "DFS Community Simulation",
    step: "Step",
    activeNode: "Active Node:",
    queue: "Queue (collections.deque):",
    stackDepth: "Recursion Stack Depth:",
    visitedSet: "Visited Set (set()):",
    reset: "Reset",
    prevStep: "Previous step",
    nextStep: "Next step",
    shortestPathDiscovered: "Shortest friendship path discovered!",
    detectedCommunities: "Detected connected communities!",
    formulaTitle: "Degree Centrality Formula",
    formulaDesc: "Calculated as degree(u) / (N - 1). The Python backend sorts influencers in O(N log N) time.",
    runningEngine: "Running Python sorting engine...",
    rank: "Rank",
    influencer: "Influencer",
    friends: "Friends",
    noUsers: "Network is currently empty. Add users and friendships first!",
    setIntersectionTitle: "Set Intersection Logic",
    setIntersectionDesc: "Computes overlapping connections between two profiles in O(min(da, db)) time using Python's optimized native set.intersection().",
    userA: "User A",
    userB: "User B",
    selectUserA: "-- Select User A --",
    selectUserB: "-- Select User B --",
    findCommonFriends: "Find Common Friends",
    mutualFound: "Mutual Friends found:"
  },
  hi: {
    bfsPath: "बीएफएस पथ",
    dfsComms: "डीएफएस समुदाय",
    centrality: "केंद्रीयता",
    mutual: "आपसी मित्र",
    selectAlgo: "एक एल्गोरिथ्म चुनें",
    chooseTab: "पायथन बैकएंड पर चलने वाले ग्राफ़ एल्गोरिदम को कॉन्फ़िगर और विज़ुअलाइज़ करने के लिए ऊपर एक टैब चुनें।",
    bfsDesc: "बीएफएस मैपिंग लॉजिक: सबसे छोटा मित्रता पथ खोजने के लिए FIFO कतार (collections.deque) का उपयोग करके स्तर-दर-स्तर खोज करता है (समय: O(V + E))।",
    startPerson: "प्रारंभिक व्यक्ति",
    targetPerson: "लक्षित व्यक्ति",
    selectStart: "-- प्रारंभ चुनें --",
    selectTarget: "-- लक्ष्य चुनें --",
    findShortestPath: "सबसे छोटा मित्रता पथ खोजें",
    dfsDesc: "डीएफएस सामुदायिक पहचान: जुड़े हुए सबग्राफ को अलग समुदायों में समूहित करने के लिए पायथन बैकएंड पर रिकर्सिव बैकट्रैकिंग और set() का उपयोग करता है।",
    detectCommunities: "मित्र समुदायों का पता लगाएं",
    bfsSim: "बीएफएस पथ सिमुलेशन",
    dfsSim: "डीएफएस समुदाय सिमुलेशन",
    step: "चरण",
    activeNode: "सक्रिय नोड:",
    queue: "कतार (collections.deque):",
    stackDepth: "रिकर्सन स्टैक गहराई:",
    visitedSet: "विज़िट किया गया सेट (set()):",
    reset: "रीसेट",
    prevStep: "पिछला चरण",
    nextStep: "अगला चरण",
    shortestPathDiscovered: "सबसे छोटा मित्रता पथ मिल गया है!",
    detectedCommunities: "कनेक्टेड समुदायों का पता चला!",
    formulaTitle: "डिग्री केंद्रीयता सूत्र",
    formulaDesc: "गणना degree(u) / (N - 1) के रूप में की जाती है। पायथन बैकएंड O(N log N) समय में प्रभावशाली लोगों को क्रमबद्ध करता है।",
    runningEngine: "पायथन सॉर्टिंग इंजन चल रहा है...",
    rank: "रैंक",
    influencer: "प्रभावशाली व्यक्ति",
    friends: "मित्र",
    noUsers: "नेटवर्क वर्तमान में खाली है। पहले उपयोगकर्ताओं और मित्रता को जोड़ें!",
    setIntersectionTitle: "सेट प्रतिच्छेदन लॉजिक",
    setIntersectionDesc: "पायथन के अनुकूलित सेट.इंटरसेक्शन() का उपयोग करके दो प्रोफाइल के बीच ओवरलैपिंग कनेक्शन की गणना करता है (समय: O(min(da, db)))।",
    userA: "उपयोगकर्ता ए",
    userB: "उपयोगकर्ता बी",
    selectUserA: "-- उपयोगकर्ता ए चुनें --",
    selectUserB: "-- उपयोगकर्ता बी चुनें --",
    findCommonFriends: "आपसी मित्र खोजें",
    mutualFound: "आपसी मित्र मिले:"
  }
};

export default function AlgorithmControls({
  users,
  graph,
  onTraceUpdate,
  selectedStartNode,
  selectedEndNode,
  theme = "dark",
  language = "en",
}: AlgorithmControlsProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BFS / DFS trace simulation state
  const [trace, setTrace] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Shortest path inputs
  const [bfsStart, setBfsStart] = useState<string>("");
  const [bfsEnd, setBfsEnd] = useState<string>("");
  const [bfsResultPath, setBfsResultPath] = useState<string[] | null>(null);

  // DFS Community results
  const [dfsCommunities, setDfsCommunities] = useState<string[][]>([]);

  // Degree Centrality results
  const [centralityRankings, setCentralityRankings] = useState<CentralityRanking[]>([]);

  // Mutual Friends
  const [mutualUser1, setMutualUser1] = useState<string>("");
  const [mutualUser2, setMutualUser2] = useState<string>("");
  const [mutualResult, setMutualResult] = useState<string[] | null>(null);

  // Synchronize canvas selection coordinates
  useEffect(() => {
    if (selectedStartNode) setBfsStart(selectedStartNode);
    if (selectedEndNode) setBfsEnd(selectedEndNode);
  }, [selectedStartNode, selectedEndNode]);

  // Handle auto-playing of trace steps
  useEffect(() => {
    let timer: any;
    if (isPlaying && trace.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, trace]);

  // Sync active visual overlays on the canvas whenever the trace step changes
  useEffect(() => {
    if (trace.length === 0 || currentStepIndex < 0 || currentStepIndex >= trace.length) {
      if (mode === "dfs" && dfsCommunities.length > 0) {
        // Keeps communities colored when DFS finishes
        onTraceUpdate(null, [], [], [], dfsCommunities);
      } else {
        onTraceUpdate(null, [], [], [], []);
      }
      return;
    }

    const currentStep = trace[currentStepIndex];
    const active = currentStep.curr_node;
    const queue = currentStep.queue || [];
    const visited = currentStep.visited || [];
    
    // For BFS, trace might have final path at the end
    let path: string[] = [];
    if (mode === "bfs" && currentStepIndex === trace.length - 1 && bfsResultPath) {
      path = bfsResultPath;
    }

    // Accumulate communities visual grouping during DFS steps
    let visualCommunities: string[][] = [];
    if (mode === "dfs") {
      // Find all completed communities or accumulate the current active community
      const completed: string[][] = [];
      
      // Parse prior steps to gather completed components
      for (let i = 0; i <= currentStepIndex; i++) {
        const step = trace[i];
        if (step.message.startsWith("Community fully detected:")) {
          const content = step.current_community || [];
          if (content.length > 0 && !completed.some(c => JSON.stringify(c) === JSON.stringify(content))) {
            completed.push(content);
          }
        }
      }

      // Add the current developing community
      const currentComm = currentStep.current_community || [];
      if (currentComm.length > 0 && !completed.some(c => c.includes(currentComm[0]))) {
        completed.push(currentComm);
      }
      visualCommunities = completed;
    }

    onTraceUpdate(active, queue, visited, path, visualCommunities);
  }, [currentStepIndex, trace, mode, dfsCommunities, bfsResultPath]);

  // Reset algorithm state
  const resetSimulation = () => {
    setTrace([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setBfsResultPath(null);
    setDfsCommunities([]);
    setCentralityRankings([]);
    setMutualResult(null);
    setError(null);
    setMode("idle");
    onTraceUpdate(null, [], [], [], []);
  };

  // Run BFS
  const handleRunBFS = async () => {
    if (!bfsStart || !bfsEnd) {
      setError("Please select both a start and target user.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setMode("bfs");
    setIsPlaying(false);

    try {
      const res = await fetch(`/api/bfs?start=${encodeURIComponent(bfsStart)}&end=${encodeURIComponent(bfsEnd)}`);
      const data = await res.json();
      
      if (data.success) {
        setTrace(data.trace || []);
        setBfsResultPath(data.path || []);
        setCurrentStepIndex(0);
        setIsPlaying(true); // Auto-play simulation
      } else {
        setError(data.message || "Failed to find shortest path in Python.");
      }
    } catch (err: any) {
      setError("Server connection failure. Please ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run DFS Communities
  const handleRunDFS = async () => {
    setError(null);
    setIsLoading(true);
    setMode("dfs");
    setIsPlaying(false);

    try {
      const res = await fetch("/api/dfs");
      const data = await res.json();
      
      if (data.success) {
        setTrace(data.trace || []);
        setDfsCommunities(data.communities || []);
        setCurrentStepIndex(0);
        setIsPlaying(true);
      } else {
        setError("Failed to run DFS Community detection.");
      }
    } catch (err: any) {
      setError("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run Degree Centrality
  const handleRunCentrality = async () => {
    setError(null);
    setIsLoading(true);
    setMode("centrality");
    
    try {
      const res = await fetch("/api/centrality");
      const data = await res.json();
      
      if (data.success) {
        setCentralityRankings(data.rankings || []);
      } else {
        setError("Failed to fetch Centrality Rankings.");
      }
    } catch (err: any) {
      setError("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run Mutual Friends Finder
  const handleRunMutual = async () => {
    if (!mutualUser1 || !mutualUser2) {
      setError("Please select two distinct users to find mutual friends.");
      return;
    }
    if (mutualUser1 === mutualUser2) {
      setError("Select two different users.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setMode("mutual");

    try {
      const res = await fetch(`/api/mutual?user1=${encodeURIComponent(mutualUser1)}&user2=${encodeURIComponent(mutualUser2)}`);
      const data = await res.json();
      
      if (data.success) {
        setMutualResult(data.mutual || []);
      } else {
        setError(data.message || "Failed to find mutual friends.");
      }
    } catch (err: any) {
      setError("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stepping mechanics
  const stepPrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const stepNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(trace.length - 1, prev + 1));
  };

  const t = ALGO_TRANSLATIONS[language];

  return (
    <div className={`flex flex-col gap-5 border rounded p-5 shadow-sm font-sans ${
      theme === "light" ? "bg-white border-slate-200 text-slate-800 shadow-sm" : "bg-slate-900/30 border-slate-800 text-slate-200"
    }`}>
      {/* Tab Selectors for different Algorithms */}
      <div className={`grid grid-cols-4 gap-1.5 p-1 rounded border ${
        theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-880"
      }`}>
        <button
          onClick={() => { resetSimulation(); setMode("bfs"); }}
          className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            mode === "bfs"
              ? "bg-indigo-600 text-white shadow"
              : theme === "light" ? "text-slate-600 hover:text-slate-900 hover:bg-white/50" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.bfsPath}
        </button>
        <button
          onClick={() => { resetSimulation(); setMode("dfs"); }}
          className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            mode === "dfs"
              ? "bg-indigo-600 text-white shadow"
              : theme === "light" ? "text-slate-600 hover:text-slate-900 hover:bg-white/50" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.dfsComms}
        </button>
        <button
          onClick={() => { resetSimulation(); handleRunCentrality(); }}
          className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            mode === "centrality"
              ? "bg-indigo-600 text-white shadow"
              : theme === "light" ? "text-slate-600 hover:text-slate-900 hover:bg-white/50" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.centrality}
        </button>
        <button
          onClick={() => { resetSimulation(); setMode("mutual"); }}
          className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            mode === "mutual"
              ? "bg-indigo-600 text-white shadow"
              : theme === "light" ? "text-slate-600 hover:text-slate-900 hover:bg-white/50" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.mutual}
        </button>
      </div>

      {error && (
        <div className={`border rounded p-3 text-[11px] font-mono flex items-center gap-2 ${
          theme === "light" ? "bg-red-50 border-red-200 text-red-600" : "bg-red-950/25 border-red-900/40 text-red-400"
        }`}>
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Screens */}
      {mode === "idle" && (
        <div className={`flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed rounded ${
          theme === "light" ? "border-slate-200 bg-slate-50/50" : "border-slate-800 bg-slate-900/5"
        }`}>
          <div className={`w-10 h-10 rounded flex items-center justify-center mb-3 border ${
            theme === "light" ? "bg-white border-slate-200 text-slate-400" : "bg-slate-900 border-slate-800 text-slate-500"
          }`}>
            <HelpCircle size={18} />
          </div>
          <h3 className={`text-xs font-bold tracking-wider uppercase ${theme === "light" ? "text-slate-800" : "text-white"}`}>
            {t.selectAlgo}
          </h3>
          <p className={`text-[10px] max-w-xs mt-1 font-mono uppercase ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
            {t.chooseTab}
          </p>
        </div>
      )}

      {/* BFS Shortest Path Config */}
      {mode === "bfs" && trace.length === 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className={`border rounded p-4 text-[10px] leading-relaxed font-mono ${
            theme === "light" ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-850 text-slate-400"
          }`}>
            💡 {language === "hi" ? (
              <><strong>बीएफएस मैपिंग लॉजिक</strong>: सबसे छोटा मित्रता पथ खोजने के लिए FIFO कतार (<code className={`px-1 py-0.5 rounded text-[9px] ${theme === "light" ? "bg-slate-200 text-indigo-700" : "bg-slate-900 text-indigo-300"}`}>collections.deque</code>) का उपयोग करके स्तर-दर-स्तर खोज करता है (समय: O(V + E))।</>
            ) : (
              <><strong>BFS Mapping Logic</strong>: Explores level-by-level using a FIFO queue (<code className={`px-1 py-0.5 rounded text-[9px] ${theme === "light" ? "bg-slate-200 text-indigo-700" : "bg-slate-900 text-indigo-300"}`}>collections.deque</code>) to find the shortest friendship path in O(V + E) time.</>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                {t.startPerson}
              </label>
              <select
                value={bfsStart}
                onChange={(e) => setBfsStart(e.target.value)}
                className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                  theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.selectStart}</option>
                {users.map((u) => (
                  <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${theme === "light" ? "text-slate-500" : "text-slate-550"}`}>
                {t.targetPerson}
              </label>
              <select
                value={bfsEnd}
                onChange={(e) => setBfsEnd(e.target.value)}
                className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                  theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.selectTarget}</option>
                {users.map((u) => (
                  <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunBFS}
            disabled={isLoading || !bfsStart || !bfsEnd}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold tracking-wider py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer"
          >
            <Search size={14} />
            <span>{t.findShortestPath}</span>
          </button>
        </div>
      )}

      {/* DFS Community Detection Config */}
      {mode === "dfs" && trace.length === 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className={`border rounded p-4 text-[10px] leading-relaxed font-mono ${
            theme === "light" ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-850 text-slate-400"
          }`}>
            💡 {language === "hi" ? (
              <><strong>डीएफएस समुदाय ढूँढना</strong>: जुड़े हुए सबग्राफ को अलग समुदायों में समूहित करने के लिए पायथन बैकएंड पर रिकर्सिव बैकट्रैकिंग और <code className={`px-1 py-0.5 rounded text-[9px] ${theme === "light" ? "bg-slate-200 text-indigo-700" : "bg-slate-900 text-indigo-300"}`}>set()</code> का उपयोग करता है।</>
            ) : (
              <><strong>DFS Community Detection</strong>: Uses recursive backtracking and a <code className={`px-1 py-0.5 rounded text-[9px] ${theme === "light" ? "bg-slate-200 text-indigo-700" : "bg-slate-900 text-indigo-300"}`}>set()</code> visited tracker on the Python backend to group connected subgraphs into isolated communities.</>
            )}
          </div>

          <button
            onClick={handleRunDFS}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold tracking-wider py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer"
          >
            <Users size={14} />
            <span>{t.detectCommunities}</span>
          </button>
        </div>
      )}

      {/* Trace Simulation Controller (For BFS / DFS) */}
      {(mode === "bfs" || mode === "dfs") && trace.length > 0 && (
        <div className={`space-y-4 border rounded p-4 animate-fade-in ${
          theme === "light" ? "bg-slate-50/50 border-slate-200" : "bg-slate-900/20 border-slate-800"
        }`}>
          {/* Simulation Header */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${
              theme === "light" ? "text-slate-600" : "text-slate-400"
            }`}>
              {mode === "bfs" ? t.bfsSim : t.dfsSim}
            </span>
            <span className={`border text-[9px] font-mono font-bold px-2.5 py-0.5 rounded ${
              theme === "light" ? "bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 border-slate-750 text-slate-350"
            }`}>
              {t.step} {currentStepIndex + 1} / {trace.length}
            </span>
          </div>

          {/* Core State Box */}
          <div className={`border rounded p-3.5 space-y-2.5 font-mono text-[11px] ${
            theme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-850 text-slate-300"
          }`}>
            <div className="flex items-baseline justify-between">
              <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                {t.activeNode}
              </span>
              <span className={`font-bold bg-yellow-500/10 px-2 py-0.5 rounded border ${
                theme === "light" ? "text-yellow-700 border-yellow-200" : "text-yellow-400 border-yellow-900/30 bg-yellow-950/40"
              }`}>
                {trace[currentStepIndex].curr_node || (language === "hi" ? "कोई नहीं" : "None")}
              </span>
            </div>

            {mode === "bfs" && (
              <div className={`flex items-baseline justify-between border-t pt-2 ${theme === "light" ? "border-slate-100" : "border-slate-850"}`}>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                  {t.queue}
                </span>
                <span className={`bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] border max-w-[200px] truncate ${
                  theme === "light" ? "text-indigo-700 border-indigo-200" : "text-indigo-400 border-indigo-900/30 bg-indigo-950/40"
                }`} title={JSON.stringify(trace[currentStepIndex].queue)}>
                  [{trace[currentStepIndex].queue?.join(", ") || ""}]
                </span>
              </div>
            )}

            {mode === "dfs" && (
              <div className={`flex items-baseline justify-between border-t pt-2 ${theme === "light" ? "border-slate-100" : "border-slate-850"}`}>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                  {t.stackDepth}
                </span>
                <span className={`bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] border font-bold ${
                  theme === "light" ? "text-indigo-700 border-indigo-200" : "text-indigo-400 border-indigo-900/30 bg-indigo-950/40"
                }`}>
                  {trace[currentStepIndex].recursion_depth ?? 0}
                </span>
              </div>
            )}

            <div className={`flex items-baseline justify-between border-t pt-2 ${theme === "light" ? "border-slate-100" : "border-slate-850"}`}>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                {t.visitedSet}
              </span>
              <span className={`bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border max-w-[200px] truncate ${
                theme === "light" ? "text-emerald-700 border-emerald-200" : "text-emerald-400 border-emerald-900/30 bg-emerald-950/40"
              }`} title={JSON.stringify(trace[currentStepIndex].visited)}>
                {`{${trace[currentStepIndex].visited?.join(", ") || ""}}`}
              </span>
            </div>

            <div className={`border-t pt-2 text-[10px] leading-relaxed italic ${
              theme === "light" ? "border-slate-100 text-slate-500" : "border-slate-850 text-slate-550"
            }`}>
              &gt; {trace[currentStepIndex].message}
            </div>
          </div>

          {/* Trace progress bar */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === "light" ? "bg-slate-200" : "bg-slate-850"}`}>
            <div
              className={`h-full ${mode === "bfs" ? "bg-blue-500" : "bg-indigo-500"} transition-all duration-300`}
              style={{ width: `${((currentStepIndex + 1) / trace.length) * 100}%` }}
            ></div>
          </div>

          {/* Simulation Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetSimulation}
              className={`flex items-center gap-1 py-1.5 px-3 border rounded text-xs transition-colors font-bold uppercase cursor-pointer ${
                theme === "light" ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
              }`}
            >
              <RotateCcw size={12} />
              <span>{t.reset}</span>
            </button>

            <div className={`flex items-center gap-1 border rounded p-0.5 ${
              theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
            }`}>
              <button
                onClick={stepPrev}
                disabled={currentStepIndex === 0}
                className={`p-1.5 disabled:opacity-30 rounded cursor-pointer ${
                  theme === "light" ? "hover:bg-white text-slate-600" : "hover:bg-slate-900 text-slate-400"
                }`}
                title="Previous step"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-1 px-3 flex items-center gap-1 text-[10px] font-bold uppercase rounded text-white cursor-pointer ${
                  isPlaying ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlaying ? (language === "hi" ? "विराम" : "Pause") : (language === "hi" ? "चलाएं" : "Play")}</span>
              </button>

              <button
                onClick={stepNext}
                disabled={currentStepIndex === trace.length - 1}
                className={`p-1.5 disabled:opacity-30 rounded cursor-pointer ${
                  theme === "light" ? "hover:bg-white text-slate-600" : "hover:bg-slate-900 text-slate-400"
                }`}
                title="Next step"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Visual BFS Path Summary at final step */}
          {mode === "bfs" && currentStepIndex === trace.length - 1 && bfsResultPath && (
            <div className={`border rounded p-4 animate-fade-in space-y-2 font-mono text-[11px] ${
              theme === "light" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-950/20 border-indigo-500/20 text-indigo-300"
            }`}>
              <div className={`font-bold flex items-center gap-1.5 uppercase ${theme === "light" ? "text-indigo-800" : "text-indigo-200"}`}>
                <Award size={14} className="text-indigo-500" />
                <span>{t.shortestPathDiscovered}</span>
              </div>
              <div className={`border p-2.5 rounded flex items-center flex-wrap gap-1.5 justify-center font-bold ${
                theme === "light" ? "bg-white border-indigo-200 text-indigo-800" : "bg-slate-950 border-slate-850 text-white"
              }`}>
                {bfsResultPath.join(" → ")}
              </div>
            </div>
          )}

          {/* Visual DFS Communities Summary at final step */}
          {mode === "dfs" && currentStepIndex === trace.length - 1 && dfsCommunities.length > 0 && (
            <div className={`border rounded p-4 animate-fade-in space-y-3 font-mono text-[11px] ${
              theme === "light" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-950/20 border-indigo-500/20 text-indigo-300"
            }`}>
              <div className={`font-bold flex items-center gap-1.5 uppercase ${theme === "light" ? "text-indigo-800" : "text-indigo-200"}`}>
                <Users size={14} className="text-indigo-500" />
                <span>{language === "hi" ? `कुल ${dfsCommunities.length} कनेक्टेड समुदाय मिले!` : `Detected ${dfsCommunities.length} Connected communities!`}</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dfsCommunities.map((community, idx) => (
                  <div key={idx} className={`border p-2 rounded flex gap-2 font-mono ${
                    theme === "light" ? "bg-white border-indigo-200" : "bg-slate-950 border-slate-850"
                  }`}>
                    <span className="font-bold font-mono text-[10px] text-white rounded px-1.5 py-0.5 flex items-center uppercase" style={{ backgroundColor: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length] }}>
                      C-{idx + 1}
                    </span>
                    <span className={`font-mono leading-normal flex-1 truncate font-semibold ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                      {community.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Degree Centrality Rankings Leaderboard */}
      {mode === "centrality" && (
        <div className="space-y-4 animate-fade-in">
          <div className={`border rounded p-4 text-[10px] leading-relaxed font-mono ${
            theme === "light" ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-850 text-slate-400"
          }`}>
            💡 <strong>{t.formulaTitle}</strong>: {t.formulaDesc}
          </div>

          {isLoading ? (
            <div className={`text-center py-8 text-xs font-mono uppercase ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
              <span className="inline-block animate-spin mr-1.5 font-bold">|</span>
              <span>{t.runningEngine}</span>
            </div>
          ) : (
            <div className={`border rounded overflow-hidden animate-fade-in ${theme === "light" ? "border-slate-200" : "border-slate-800"}`}>
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[9px] ${
                    theme === "light" ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-slate-900/50 text-slate-400 border-slate-800"
                  }`}>
                    <th className="py-2.5 px-3 w-14 text-center">{language === "hi" ? "रैंक" : "Rank"}</th>
                    <th className="py-2.5 px-3">{language === "hi" ? "प्रभावशाली" : "Influencer"}</th>
                    <th className="py-2.5 px-3 text-center">{language === "hi" ? "मित्र" : "Friends"}</th>
                    <th className="py-2.5 px-3 text-right">{language === "hi" ? "केंद्रीयता" : "Centrality"}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${
                  theme === "light" ? "divide-slate-200 bg-white text-slate-750" : "divide-slate-850 bg-slate-950/20 text-slate-300"
                }`}>
                  {centralityRankings.map((rank, idx) => (
                    <tr key={rank.username} className={`border-b transition-colors ${
                      theme === "light"
                        ? `hover:bg-slate-50 border-slate-100 ${idx === 0 ? "bg-indigo-50/50" : ""}`
                        : `hover:bg-slate-850/20 border-slate-850 ${idx === 0 ? "bg-indigo-950/10" : ""}`
                    }`}>
                      <td className="py-2 px-3 text-center">
                        {idx === 0 ? (
                          <span className={`inline-flex items-center justify-center border font-mono font-bold rounded px-1.5 py-0.5 text-[9px] ${
                            theme === "light" ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          }`}>
                            🏆 1st
                          </span>
                        ) : idx === 1 ? (
                          <span className={`inline-flex items-center justify-center border rounded px-1.5 py-0.5 font-bold text-[9px] ${
                            theme === "light" ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-800 border-slate-700 text-slate-300"
                          }`}>
                            🥈 2nd
                          </span>
                        ) : (
                          <span className={`font-semibold font-sans ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>{idx + 1}</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 font-semibold font-sans ${theme === "light" ? "text-slate-900" : "text-slate-200"}`}>{rank.username}</td>
                      <td className="py-2 px-3 text-center font-bold text-indigo-500">{rank.degree}</td>
                      <td className={`py-2 px-3 text-right font-bold ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{rank.centrality.toFixed(4)}</td>
                    </tr>
                  ))}
                  {centralityRankings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500 text-xs font-sans italic uppercase tracking-wider">
                        {t.noUsers}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mutual Friends Config & Display */}
      {mode === "mutual" && (
        <div className="space-y-4 animate-fade-in">
          <div className={`border rounded p-4 text-[10px] leading-relaxed font-mono ${
            theme === "light" ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-850 text-slate-400"
          }`}>
            💡 <strong>{t.setIntersectionTitle}</strong>: {t.setIntersectionDesc}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>
                {t.userA}
              </label>
              <select
                value={mutualUser1}
                onChange={(e) => setMutualUser1(e.target.value)}
                className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                  theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.selectUserA}</option>
                {users.map((u) => (
                  <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[9px] font-bold uppercase tracking-widest mb-1 ${theme === "light" ? "text-slate-500" : "text-slate-550"}`}>
                {t.userB}
              </label>
              <select
                value={mutualUser2}
                onChange={(e) => setMutualUser2(e.target.value)}
                className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono ${
                  theme === "light" ? "bg-white border-slate-300 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="" className={theme === "light" ? "bg-white" : "bg-slate-900"}>{t.selectUserB}</option>
                {users.map((u) => (
                  <option key={u} value={u} className={theme === "light" ? "bg-white" : "bg-slate-900"}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunMutual}
            disabled={isLoading || !mutualUser1 || !mutualUser2 || mutualUser1 === mutualUser2}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold tracking-wider py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer"
          >
            <Search size={14} />
            <span>{t.findCommonFriends}</span>
          </button>

          {mutualResult !== null && (
            <div className={`border rounded p-4 animate-fade-in space-y-2 font-mono text-[11px] ${
              theme === "light" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-950/20 border-indigo-900/30 text-indigo-300"
            }`}>
              <div className={`font-bold uppercase ${theme === "light" ? "text-indigo-800" : "text-indigo-200"}`}>
                {t.mutualFound} {mutualResult.length}
              </div>
              {mutualResult.length > 0 ? (
                <div className={`font-mono text-xs font-bold border py-1.5 px-2.5 rounded ${
                  theme === "light" ? "bg-white border-indigo-200 text-indigo-650" : "bg-slate-950 border-slate-850 text-indigo-400"
                }`}>
                  {mutualResult.join(", ")}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  {language === "hi"
                    ? `यूजर ए '${mutualUser1}' और यूजर बी '${mutualUser2}' के बीच कोई आपसी मित्र नहीं हैं।`
                    : `No mutual friends between '${mutualUser1}' and '${mutualUser2}'.`}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
