import React, { useState, useEffect } from "react";
import { 
  LogOut, CheckCircle, Plus, Trash2, ListTodo, Calendar, 
  BarChart3, Columns3, CheckSquare, Clock, TrendingUp, Sparkles, User, Activity, ShieldAlert, Tag, ArrowUpRight, TrendingDown,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("analytics"); // Metrics dashboard defaults on load
  const [newTask, setNewTask] = useState("");
  const [taskTag, setTaskTag] = useState("General");
  const [taskDate, setTaskDate] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // 🌟 Sidebar visibility state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
    } catch (err) {
      console.error("Error connecting to backend task API:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: newTask, 
          status: "todo",
          tag: taskTag,
          dueDate: taskDate
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTasks([data, ...tasks]); 
        setNewTask("");
        setTaskDate("");
        setTaskTag("General");
      }
    } catch (err) {
      console.error("Failed to append task blueprint:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error("Database status synchronization failed:", err);
      setTasks(originalTasks); 
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to remove target document:", err);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    setIsDragging(true);
  };
  const handleDragEnd = () => setIsDragging(false);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) updateStatus(taskId, targetStatus);
    setIsDragging(false);
  };

  // Math Metrics
  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === "done").length;
  const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
  const todoCount = tasks.filter(t => t.status === "todo").length;
  const completionRate = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  const pipelineBacklogLoad = todoCount + inProgressCount;
  const rollingEfficiencyScore = totalTasks 
    ? Math.min(100, Math.round(((doneCount * 1.5) / (totalTasks + (todoCount * 0.5))) * 100)) 
    : 0;

  const queueIsOverloaded = pipelineBacklogLoad > 5;
  const filteredTasks = tasks.filter(t => activeFilter === "all" || t.tag === activeFilter);

  // Clean Isolated Functional UI Component Block
  const DynamicInputRibbonComponent = () => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 mb-8">
      <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-3">
        <input type="text" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-400 font-normal" placeholder="Forge new pipeline item details..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <div className="flex gap-2">
          <select value={taskTag} onChange={(e) => setTaskTag(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 cursor-pointer font-normal">
            <option value="General">General</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Bug">Bug</option>
          </select>
          <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 cursor-pointer font-normal" />
        </div>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-5 rounded-xl flex items-center justify-center gap-2 text-sm tracking-wide transition-all cursor-pointer font-normal py-2.5"><Plus className="h-4 w-4 stroke-[2]" /> Forge</button>
      </form>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-400">
        <span className="flex items-center gap-1 mr-2"><Tag className="h-3.5 w-3.5" /> Filter tags:</span>
        {["all", "General", "Frontend", "Backend", "Bug"].map(tag => (
          <button key={tag} onClick={() => setActiveFilter(tag)} className={`px-2.5 py-1 rounded-md transition-all ${activeFilter === tag ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ fontFamily: '"Bookman Old Style", Bookman, serif' }} className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
          <div className="h-12 bg-white border border-slate-200 rounded-xl w-full relative overflow-hidden" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden space-y-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Bookman Old Style", Bookman, serif' }} className="min-h-screen bg-slate-100 text-slate-800 flex antialiased tracking-tight selection:bg-slate-200 selection:text-slate-900 font-normal">
      
      {/* 🌟 FLEXIBLE/COLLAPSIBLE LEFT SIDEBAR NAVIGATION */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen shadow-sm transition-all duration-300 ease-in-out relative`}>
        <div className="space-y-8">
          
          {/* Header Area with Brand Label toggle */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-slate-800 p-2 rounded-xl text-white shadow-sm shrink-0">
                <ListTodo className="h-5 w-5 stroke-[2]" />
              </div>
              {isSidebarOpen && (
                <span style={{ fontFamily: '"Times New Roman", Times, serif' }} className="text-lg tracking-wider text-slate-800 font-normal transition-opacity duration-300 whitespace-nowrap">
                  TASK<span className="text-slate-400 font-normal">FORGE</span>
                </span>
              )}
            </div>
          </div>

          {/* 🔘 Toggle Open/Close button controller */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* Navigation links matching flexible state sizing widths */}
          <nav className="space-y-1">
            <button onClick={() => setActiveTab("blueprint")} className={`w-full flex items-center ${isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center p-3"} py-3 rounded-xl text-sm tracking-wide transition-all duration-150 cursor-pointer font-normal ${activeTab === "blueprint" ? "bg-slate-100 text-slate-900 border-l-2 border-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <CheckSquare className="h-4 w-4 shrink-0" /> 
              {isSidebarOpen && <span className="whitespace-nowrap">Active Blueprint</span>}
            </button>
            <button onClick={() => setActiveTab("kanban")} className={`w-full flex items-center ${isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center p-3"} py-3 rounded-xl text-sm tracking-wide transition-all duration-150 cursor-pointer font-normal ${activeTab === "kanban" ? "bg-slate-100 text-slate-900 border-l-2 border-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <Columns3 className="h-4 w-4 shrink-0" /> 
              {isSidebarOpen && <span className="whitespace-nowrap">Kanban Board</span>}
            </button>
            <button onClick={() => setActiveTab("analytics")} className={`w-full flex items-center ${isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center p-3"} py-3 rounded-xl text-sm tracking-wide transition-all duration-150 cursor-pointer font-normal ${activeTab === "analytics" ? "bg-slate-100 text-slate-900 border-l-2 border-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <BarChart3 className="h-4 w-4 shrink-0" /> 
              {isSidebarOpen && <span className="whitespace-nowrap">Insights & Metrics</span>}
            </button>
          </nav>
        </div>

        {/* Footer Area with Identity toggle updates */}
        <div className="border-t border-slate-200 pt-4 space-y-3 overflow-hidden">
          <div className="flex items-center gap-3 px-2 justify-center md:justify-start">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-normal shrink-0"><User className="h-4 w-4" /></div>
            {isSidebarOpen && (
              <div className="truncate transition-opacity duration-300">
                <p className="text-sm text-slate-800 truncate font-normal">Greeshmitha</p>
                <p className="text-xs text-slate-400 truncate font-normal">Workspace Owner</p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className={`w-full flex items-center justify-center ${isSidebarOpen ? "gap-2 px-4" : "p-3"} bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 py-2 rounded-xl text-xs tracking-wide transition-all duration-150 cursor-pointer font-normal`}>
            <LogOut className="h-3.5 w-3.5 shrink-0" /> 
            {isSidebarOpen && <span className="whitespace-nowrap">Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS PANEL */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-end sticky top-0 z-40">
          <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg flex items-center gap-1.5 tracking-wide font-normal"><Clock className="h-3.5 w-3.5 text-slate-600" /> Persistent Storage Linked</span>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          
          {/* VIEW 1: BLUEPRINT VIEWER */}
          {activeTab === "blueprint" && (
            <div className="space-y-6">
              <DynamicInputRibbonComponent />
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {filteredTasks.map(task => (
                    <div key={task._id} className="p-4 sm:p-5 flex items-center justify-between gap-4 group hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-700 transition-all pl-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button type="button" onClick={() => updateStatus(task._id, task.status === "done" ? "todo" : "done")} className={`h-5 w-5 rounded-lg border flex items-center justify-center cursor-pointer ${task.status === "done" ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 bg-white"}`}>{task.status === "done" && <CheckCircle className="h-3.5 w-3.5 stroke-[2]" />}</button>
                        <div className="truncate">
                          <p className={`text-sm font-normal ${task.status === "done" ? "line-through text-slate-400" : "text-slate-700"}`}>{task.text}</p>
                          <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{task.tag}</span>
                            {task.dueDate && <span className="flex items-center gap-1 text-slate-500"><Calendar className="h-3 w-3" /> {task.dueDate}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)} className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg px-2.5 py-1 cursor-pointer tracking-wide font-normal"><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Completed</option></select>
                        <button onClick={() => deleteTask(task._id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: KANBAN DRAW BOARD */}
          {activeTab === "kanban" && (
            <div className="space-y-6">
              <div className="bg-slate-200 rounded-2xl border-4 border-slate-300 shadow-xl overflow-hidden max-w-5xl mx-auto ring-8 ring-slate-400/10">
                <div className="grid grid-cols-3 divide-x-2 divide-slate-300 min-h-[680px] bg-white">
                  {["todo", "in-progress", "done"].map((column, colIdx) => (
                    <div key={column} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column)} className={`p-6 flex flex-col transition-colors duration-200 ${isDragging ? "bg-slate-50" : ""}`}>
                      <div className="text-center mb-8 pb-3 border-b-2 border-dashed border-slate-100 select-none">
                        <h3 style={{ fontFamily: '"Bookman Old Style", Bookman, serif' }} className="text-2xl text-slate-800 tracking-tight opacity-95 font-normal">
                          {column === "todo" ? "To do" : column === "in-progress" ? "In progress" : "Done"}
                        </h3>
                        <div className="w-12 h-1 bg-slate-200 mx-auto mt-1.5 rounded-full" />
                      </div>
                      <div className="flex-1 overflow-y-auto flex flex-row flex-wrap content-start justify-center gap-5 p-2 min-h-[480px]">
                        {filteredTasks.filter(t => t.status === column).map((task, taskIdx) => {
                          const rotationClass = (taskIdx + colIdx) % 4 === 0 ? "-rotate-3 translate-y-1.5 translate-x-0.5" : (taskIdx + colIdx) % 4 === 1 ? "rotate-2 -translate-y-1" : (taskIdx + colIdx) % 4 === 2 ? "rotate-1 translate-x-1" : "-rotate-1 -translate-y-0.5 -translate-x-0.5";
                          const charSum = task.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const colorPool = ["bg-[#ff96b5] border-pink-300 shadow-pink-900/5 hover:bg-[#ff80a5]", "bg-[#ffbe76] border-orange-300 shadow-orange-900/5 hover:bg-[#ffa743]", "bg-[#c3b1e1] border-purple-300 shadow-purple-900/5 hover:bg-[#b09be1]", "bg-[#fdfd96] border-yellow-200 shadow-yellow-900/5 hover:bg-[#ffff80]", "bg-[#7cd1f9] border-blue-300 shadow-blue-900/5 hover:bg-[#5ac4f7]", "bg-[#badc58] border-green-300 shadow-green-900/5 hover:bg-[#a9cf3b]"];
                          const stickieBg = colorPool[charSum % colorPool.length];
                          return (
                            <div key={task._id} draggable onDragStart={(e) => handleDragStart(e, task._id)} onDragEnd={handleDragEnd} className={`w-36 h-36 p-3 flex flex-col justify-between border rounded-xs shadow-sm transition-all duration-150 hover:scale-105 hover:shadow-md hover-wobble cursor-grab active:cursor-grabbing group relative ${rotationClass} ${stickieBg}`}>
                              <div className="overflow-y-auto max-h-[75px] pr-0.5">
                                <p style={{ fontFamily: '"Segoe Print", "Segoe Script", sans-serif' }} className="text-xs leading-relaxed text-slate-900 tracking-tight select-none font-normal">
                                  {task.text}
                                </p>
                              </div>
                              <div style={{ fontFamily: '"Segoe Print", sans-serif' }} className="text-[9px] text-slate-700/80 space-y-0.5 border-t border-black/5 pt-1">
                                <div className="flex justify-between items-center">
                                  <span>🏷️ {task.tag || "General"}</span>
                                  <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-rose-900 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                                </div>
                                {task.dueDate && <p className="truncate">📅 {task.dueDate}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: LIVE ANALYTICS METRICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Top Operational Status Bar */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </div>
                  <div>
                    <h2 className="text-sm text-slate-800 tracking-wide uppercase font-normal">Live Workspace Telemetry Overview</h2>
                    <p className="text-xs text-slate-400 font-normal tracking-wide">Streaming connection secured to pipeline cluster ports</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-slate-500 tracking-wide font-normal">
                  <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-blue-500" /> Ping: 14ms</span>
                  <span className="flex items-center gap-1.5 border-l border-slate-200 pl-6"><Clock className="h-3.5 w-3.5 text-slate-500" /> Refresh: Real-time</span>
                </div>
              </div>

              {/* Data Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-[240px] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <div>
                    <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1 font-normal">Live Scope Tickets</span>
                    <p className="text-6xl text-slate-800 tracking-tighter mt-2 font-normal">{totalTasks}</p>
                    <p className="text-xs text-blue-600 mt-1 uppercase tracking-wider font-normal">Total Cluster Nodes Indexed</p>
                  </div>
                  <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 flex justify-between tracking-wide font-normal">
                    <span>Active Storage Block: MongoDB</span>
                    <span className="text-blue-600">100% Sync</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-[240px] shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${queueIsOverloaded ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <div>
                    <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1 font-normal flex items-center justify-between">
                      <span>Response Queue Wait</span>
                      {queueIsOverloaded ? (
                        <span className="text-rose-500 flex items-center text-[9px] font-bold bg-rose-50 px-1 rounded">HIGH LOAD <ArrowUpRight className="h-3 w-3 inline ml-0.5" /></span>
                      ) : (
                        <span className="text-emerald-600 flex items-center text-[9px] font-bold bg-emerald-50 px-1 rounded">STABLE <TrendingDown className="h-3 w-3 inline ml-0.5" /></span>
                      )}
                    </span>
                    <p className={`text-6xl tracking-tighter mt-2 font-normal ${queueIsOverloaded ? 'text-rose-600' : 'text-amber-600'}`}>{pipelineBacklogLoad}</p>
                    <p className="text-xs text-slate-500 mt-2 tracking-wide font-normal">Items currently awaiting action in deployment streams</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center text-xs pt-3 border-t border-slate-100 tracking-wide font-normal">
                    <div className="bg-slate-50 py-1.5 px-3 border border-slate-100 rounded-lg"><span className="block text-[10px] text-slate-400 uppercase font-normal">Queued</span><span className="text-sm text-slate-700 font-normal">{todoCount}</span></div>
                    <div className="bg-slate-50 py-1.5 px-3 border border-slate-100 rounded-lg"><span className="block text-[10px] text-slate-400 uppercase font-normal">Active</span><span className="text-sm font-normal text-amber-600">{inProgressCount}</span></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-[240px] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <div>
                    <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1 font-normal">Production Cleared</span>
                    <p className="text-6xl text-emerald-600 tracking-tighter mt-2 font-normal">{doneCount}</p>
                    <p className="text-xs text-emerald-600 mt-1 uppercase tracking-wider font-normal">✓ SLA Threshold Maintained</p>
                  </div>
                  <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 flex items-center gap-1.5 tracking-wide font-normal">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 
                    Archive compilation records active
                  </div>
                </div>
              </div>

              {/* Progress Visualization Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2 flex flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-normal">Ecosystem Velocity</span>
                      <h3 className="text-lg text-slate-800 mt-0.5 tracking-tight font-normal">Fulfillment Performance Ratio</h3>
                    </div>
                    <span className="text-2xl text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl shadow-inner font-normal">
                      {completionRate}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-6 w-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1 shadow-inner relative">
                      <div 
                        className="h-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-md transition-all duration-500 ease-out shadow-sm relative" 
                        style={{ width: `${completionRate}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase text-slate-400 tracking-wider px-0.5 font-normal">
                      <span>System Init</span>
                      <span>Target Baseline Reached ({completionRate}%)</span>
                      <span>Max Efficiency</span>
                    </div>
                  </div>
                </div>

                {/* ROLLING INTERACTIVE MONITOR PANEL */}
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block mb-1 font-normal">Rolling Workspace Velocity</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-normal text-slate-800 tracking-tight">{rollingEfficiencyScore}%</span>
                      <span className="text-xs text-slate-400 font-medium tracking-wide">Efficiency Rating</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Calculated dynamically using real-time node outputs vs unresolved load pressures.
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2 tracking-wide font-normal">
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                    <span>Diagnostics clear. System operating within limits.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}