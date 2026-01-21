import React, { useState, useEffect, useRef } from 'react';
import { solveWaterJugBFS, PYTHON_SCRIPT } from './utils/bfs';
import { Jug } from './components/Jug';
import { SolutionStep } from './types';
import { explainSolution } from './services/geminiService';
import { Play, RotateCcw, BrainCircuit, ChevronRight, Settings, Sparkles, List, FileCode, Activity, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // Configuration State
  const [capA, setCapA] = useState<number>(4);
  const [capB, setCapB] = useState<number>(3);
  const [goal, setGoal] = useState<number>(2);

  // Solution State
  const [solution, setSolution] = useState<SolutionStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'steps' | 'algo'>('steps');

  // AI State
  const [explanation, setExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  
  // Refs for auto-scrolling
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-scroll to active step
  useEffect(() => {
    if (activeTab === 'steps' && solution && itemRefs.current[stepIndex]) {
      itemRefs.current[stepIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [stepIndex, solution, activeTab]);

  // Solving logic
  const handleSolve = () => {
    setError(null);
    setSolution(null);
    setStepIndex(0);
    setExplanation("");
    setActiveTab('steps');
    itemRefs.current = []; // Reset refs
    
    if (goal > Math.max(capA, capB)) {
      setError("Goal cannot exceed the capacity of the largest jug.");
      return;
    }
    if (goal < 0 || capA <= 0 || capB <= 0) {
      setError("Capacities and goal must be positive.");
      return;
    }

    try {
      const steps = solveWaterJugBFS(capA, capB, goal);
      if (steps) {
        setSolution(steps);
      } else {
        setError("No solution possible for these parameters.");
      }
    } catch (e) {
      setError("An error occurred while running BFS.");
    }
  };

  // Auto-play effect or similar could go here, but manual stepping is often better for algorithms
  const nextStep = () => {
    if (solution && stepIndex < solution.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (solution && stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const reset = () => {
    setStepIndex(0);
  };

  const handleAIExplain = async () => {
    if (!solution) return;
    setLoadingAI(true);
    const text = await explainSolution(capA, capB, goal, solution);
    setExplanation(text);
    setLoadingAI(false);
  };

  const currentStep = solution ? solution[stepIndex] : { a: 0, b: 0, action: 'Start', description: 'Ready to solve' };
  const prevSolutionStep = solution && stepIndex > 0 ? solution[stepIndex - 1] : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* LEFT PANEL: Controls & Configuration */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-sm z-10 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
               W
            </div>
            Water Jug BFS
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Configure the jugs and goal to visualize the Breadth-First Search solution.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jug A Capacity (L)</label>
            <input 
              type="number" 
              value={capA}
              onChange={(e) => setCapA(parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jug B Capacity (L)</label>
            <input 
              type="number" 
              value={capB}
              onChange={(e) => setCapB(parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Goal (L) in Jug A</label>
            <input 
              type="number" 
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <button 
            onClick={handleSolve}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Play size={18} /> Solve with BFS
          </button>

          {error && (
             <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
               {error}
             </div>
          )}
        </div>

        {solution && (
          <div className="mt-auto pt-6 border-t border-slate-100">
             <button 
               onClick={handleAIExplain}
               disabled={loadingAI}
               className={`
                 w-full py-3 px-4 rounded-xl font-semibold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden
                 ${loadingAI 
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                   : explanation 
                     ? 'bg-white border-2 border-violet-100 text-violet-700 hover:bg-violet-50'
                     : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5'
                 }
               `}
             >
               {loadingAI ? (
                 <>
                   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                   <span>Analyzing Logic...</span>
                 </>
               ) : explanation ? (
                 <>
                   <Sparkles size={18} className="text-violet-500" />
                   <span>Regenerate Explanation</span>
                 </>
               ) : (
                 <>
                   <BrainCircuit size={18} className="group-hover:rotate-12 transition-transform" />
                   <span>Explain Logic with AI</span>
                 </>
               )}
             </button>
             
             {explanation && (
                <div className="mt-4 bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden animate-fade-in-up ring-1 ring-violet-50">
                  <div className="bg-violet-50/50 px-4 py-3 border-b border-violet-100 flex items-center gap-2">
                    <div className="p-1 bg-violet-100 rounded text-violet-600">
                        <BrainCircuit size={14} />
                    </div>
                    <h4 className="font-bold text-sm text-violet-900">AI Insight</h4>
                  </div>
                  <div className="p-4 text-sm text-slate-600 leading-relaxed space-y-3 bg-gradient-to-b from-white to-violet-50/10">
                    {explanation.split('\n').map((paragraph, idx) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        return (
                            <p key={idx} dangerouslySetInnerHTML={{ 
                                __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-800 font-semibold">$1</strong>') 
                            }} />
                        );
                    })}
                  </div>
                </div>
             )}
          </div>
        )}
      </div>

      {/* CENTER PANEL: Visualization */}
      <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="z-10 flex flex-col items-center w-full max-w-2xl">
           {solution ? (
              <>
                 <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Step {stepIndex + 1} of {solution.length}</h2>
                    <p className="text-xl text-blue-600 font-medium">{currentStep.description}</p>
                 </div>

                 <div className="flex items-end gap-16 mb-12">
                    <Jug 
                      name="Jug A" 
                      capacity={capA} 
                      current={currentStep.a} 
                      isActive={currentStep.action.includes('A')} 
                    />
                    <Jug 
                      name="Jug B" 
                      capacity={capB} 
                      current={currentStep.b} 
                      color="bg-sky-400"
                      isActive={currentStep.action.includes('B')}
                    />
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={reset}
                      className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 shadow-sm transition-transform active:scale-95"
                      title="Reset"
                    >
                       <RotateCcw size={24} />
                    </button>
                    <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                      <button 
                        onClick={prevStep}
                        disabled={stepIndex === 0}
                        className="px-6 py-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-medium transition-colors"
                      >
                        Previous
                      </button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button 
                        onClick={nextStep}
                        disabled={stepIndex === solution.length - 1}
                        className="px-6 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-transparent font-medium transition-colors flex items-center gap-1"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                 </div>
              </>
           ) : (
             <div className="text-center text-slate-400 max-w-md">
                <Settings size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">Configure the problem on the left and click "Solve" to see the visualization.</p>
             </div>
           )}
        </div>
      </div>

      {/* RIGHT PANEL: Step List & Algorithm */}
      {solution && (
        <div className="w-full md:w-1/4 lg:w-1/5 bg-white border-l border-slate-200 flex flex-col shadow-lg z-20">
          
          {/* TABS HEADER */}
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('steps')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'steps' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
              <List size={16} /> Steps
            </button>
            <button 
              onClick={() => setActiveTab('algo')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'algo' ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
              <FileCode size={16} /> Logic
            </button>
          </div>

          {activeTab === 'steps' ? (
             <>
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                 <h3 className="font-bold text-slate-700">Solution Path</h3>
                 <p className="text-xs text-slate-500">{solution.length - 1} operations found</p>
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                 <div className="flex flex-col gap-2">
                   {solution.map((step, idx) => (
                     <button
                       key={idx}
                       ref={(el) => { itemRefs.current[idx] = el; }}
                       onClick={() => setStepIndex(idx)}
                       className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                         idx === stepIndex 
                           ? 'bg-blue-600 border-blue-700 shadow-lg scale-[1.02] z-10' 
                           : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:translate-x-1'
                       }`}
                     >
                       <div className="flex justify-between items-center mb-1">
                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                             idx === stepIndex ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                         }`}>
                           Step {idx}
                         </span>
                         <span className={`text-xs font-mono ${
                             idx === stepIndex ? 'text-blue-100' : 'text-slate-400'
                         }`}>({step.a}, {step.b})</span>
                       </div>
                       <div className={`text-sm font-medium ${
                         idx === stepIndex ? 'text-white' : ''
                       }`}>
                         {step.action}
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
             </>
          ) : (
             <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                {/* Dynamic Step Logic */}
                <div className="mb-6 bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                    <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <Activity size={16} /> Current Step Logic
                    </h3>
                    {stepIndex === 0 ? (
                        <div className="text-xs text-slate-600 space-y-2">
                            <p><strong>Initialization:</strong></p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Algorithm starts with both jugs empty <code>(0, 0)</code>.</li>
                                <li>Queue initialized: <code>[(0, 0)]</code>.</li>
                                <li>Visited set initialized: <code>{`{(0, 0)}`}</code>.</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-600 space-y-2">
                             <div className="flex items-center gap-2 mb-2 text-slate-500">
                                {prevSolutionStep && (
                                   <span className="font-mono bg-slate-100 px-1 rounded">
                                     ({prevSolutionStep.a}, {prevSolutionStep.b})
                                   </span>
                                )}
                                <ArrowRight size={12} />
                                <span className="font-bold text-purple-600">{currentStep.action}</span>
                                <ArrowRight size={12} />
                                <span className="font-mono bg-slate-100 px-1 rounded">({currentStep.a}, {currentStep.b})</span>
                             </div>
                             <p><strong>BFS Operation:</strong></p>
                             <ul className="list-disc pl-4 space-y-1">
                                <li>Dequeued parent state <code>({prevSolutionStep?.a}, {prevSolutionStep?.b})</code>.</li>
                                <li>Generated neighbor state <code>({currentStep.a}, {currentStep.b})</code> by applying rule <strong>{currentStep.action}</strong>.</li>
                                <li>Checked <code>visited</code> set: State was new.</li>
                                <li>Enqueued state and recorded path.</li>
                             </ul>
                        </div>
                    )}
                </div>

                <div className="prose prose-sm prose-slate mb-6">
                   <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                     <BrainCircuit size={16} className="text-purple-600"/> Algorithm Details
                   </h3>
                   <ul className="text-xs text-slate-600 space-y-3 list-none pl-0">
                     <li className="flex gap-2 items-start">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                        <span><strong className="text-slate-700">State:</strong> Tuple <code>(A, B)</code> showing water levels.</span>
                     </li>
                     <li className="flex gap-2 items-start">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                        <span><strong className="text-slate-700">Strategy:</strong> Explores all 6 possible moves layer by layer.</span>
                     </li>
                   </ul>
                </div>

                {/* Full Code Section */}
                <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <FileCode size={16} className="text-slate-600"/> Full Python Solution
                    </h3>
                    <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto border border-slate-700 shadow-sm relative group">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                         <pre className="text-[10px] leading-relaxed font-mono text-blue-300 mt-2">
                            {PYTHON_SCRIPT}
                         </pre>
                    </div>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;