import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Trash, 
  PlusCircle, 
  Star, 
  Save, 
  Send,
  Building,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  id: string;
  type: 'rating' | 'choice' | 'text';
  text: string;
  options?: string[];
  required?: boolean;
}

const initialCampaigns = [
  { 
    status: 'ACTIVE', date: 'Jan 15, 2026', 
    title: 'Enterprise Technical Integration check', dept: 'Support', 
    responses: 488, csat: '88%' 
  },
  { 
    status: 'ACTIVE', date: 'Feb 1, 2026', 
    title: 'SDK Developer Onboarding Feedback', dept: 'Sales', 
    responses: 310, csat: '94%' 
  },
  { 
    status: 'DRAFT', date: 'Feb 28, 2026', 
    title: 'Product Beta Tester Survey 2026', dept: 'Engineering', 
    responses: 0, csat: 'N/A' 
  },
  { 
    status: 'CLOSED', date: 'Dec 10, 2025', 
    title: 'Account Executive Q1 Relationship Survey', dept: 'Product', 
    responses: 142, csat: '81%' 
  },
];

export function Surveys() {
  const [campaignsList, setCampaignsList] = useState(initialCampaigns);
  const [isCreating, setIsCreating] = useState(false);
  
  // Creator Form States
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [selectedDept, setSelectedDept] = useState('Support');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>('q-1');
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: 'q-1', 
      type: 'rating', 
      text: 'How satisfied were you with the response speed?', 
      required: true 
    }
  ]);

  const handleAddQuestion = () => {
    const newId = `q-${Date.now()}`;
    const newQuestion: Question = {
      id: newId,
      type: 'rating',
      text: 'New Question',
      required: false
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newId);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    if (activeQuestionId === id && updated.length > 0) {
      setActiveQuestionId(updated[0].id);
    }
  };

  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleQuestionTypeChange = (id: string, type: 'rating' | 'choice' | 'text') => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated: Question = { ...q, type };
        if (type === 'choice') {
          updated.options = ['Option 1', 'Option 2'];
        } else {
          delete updated.options;
        }
        return updated;
      }
      return q;
    }));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (qId: string, optIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        const newOpts = [...q.options];
        newOpts[optIndex] = text;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleDeleteOption = (qId: string, optIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        return { ...q, options: q.options.filter((_, idx) => idx !== optIndex) };
      }
      return q;
    }));
  };

  const handleToggleRequired = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, required: !q.required } : q));
  };

  const handleDeleteCampaign = (index: number) => {
    setCampaignsList(campaignsList.filter((_, idx) => idx !== index));
  };

  const handleLaunchCampaign = (status: 'ACTIVE' | 'DRAFT') => {
    if (!surveyTitle.trim()) {
      alert('Please enter a survey title.');
      return;
    }

    const newCampaign = {
      status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: surveyTitle.trim(),
      dept: selectedDept,
      responses: 0,
      csat: 'N/A'
    };

    setCampaignsList([newCampaign, ...campaignsList]);
    setIsCreating(false);
    
    // Reset Form
    setSurveyTitle('');
    setSurveyDesc('');
    setSelectedDept('Support');
    setQuestions([
      { 
        id: 'q-1', 
        type: 'rating', 
        text: 'How satisfied were you with the response speed?', 
        required: true 
      }
    ]);
    setActiveQuestionId('q-1');
  };

  return (
    <div className="h-full max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Survey Campaigns</h2>
            <span className="text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase border border-emerald-200">
              Super Admin Mode
            </span>
          </div>
          <p className="text-gray-500 text-sm">Manage external customer response rules and design Google Forms style survey layouts.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Launch Survey Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaignsList.map((campaign, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                campaign.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" :
                campaign.status === 'DRAFT' ? "bg-gray-100 text-gray-600" :
                "bg-red-50 text-red-600"
              )}>
                {campaign.status}
              </span>
              <span className="text-xs font-medium text-gray-400">{campaign.date}</span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">{campaign.title}</h3>
              <span className="inline-flex text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                Dept: {campaign.dept}
              </span>
            </div>
            
            <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responses</div>
                  <div className="font-bold text-gray-900">{campaign.responses}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CSAT Rating</div>
                  <div className="font-bold text-gray-900">{campaign.csat}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCampaign(i)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Floating Survey Creator Modal Overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center overflow-y-auto py-10 px-4 transition-all duration-300">
          <div className="bg-gray-50 rounded-2xl w-full max-w-4xl shadow-2xl relative border border-gray-200 pb-12 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Creator Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleLaunchCampaign('DRAFT')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                <button 
                  onClick={() => handleLaunchCampaign('ACTIVE')}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Launch Campaign
                </button>
              </div>
            </div>

            {/* Survey Creator Canvas */}
            <div className="space-y-6">
              
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="p-8">
                  <input 
                    type="text" 
                    placeholder="Survey Title" 
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    className="w-full text-3xl font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-none pb-2 transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Form description (optional)" 
                    value={surveyDesc}
                    onChange={(e) => setSurveyDesc(e.target.value)}
                    className="w-full text-sm text-gray-500 border-b border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-none mt-4 pb-1 transition-all"
                  />
                  
                  {/* Department & Meta Selector */}
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <Building className="w-4 h-4" /> Select Target Department
                    </div>
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="Support">Support</option>
                      <option value="Sales">Sales</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions Render */}
              {questions.map((question, index) => {
                const isActive = activeQuestionId === question.id;
                
                return (
                  <div 
                    key={question.id} 
                    onClick={() => setActiveQuestionId(question.id)}
                    className={cn(
                      "bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden",
                      isActive ? "border-indigo-600 shadow-md ring-1 ring-indigo-500/10" : "border-gray-150 hover:border-gray-300"
                    )}
                  >
                    <div className="p-6 relative">
                      
                      {/* Active Question Left Indicator Bar */}
                      {isActive && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600"></div>
                      )}

                      {/* Question Header & Type Selection */}
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                        <div className="flex-1 w-full">
                          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Question {index + 1}</div>
                          <input 
                            type="text" 
                            placeholder="Untitled Question"
                            value={question.text}
                            onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                            className="w-full font-bold text-gray-800 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none pb-1.5 transition-all text-base"
                          />
                        </div>
                        
                        {/* Question Type Selector (Only displayed when active) */}
                        <div className="w-full md:w-auto">
                          <select 
                            value={question.type}
                            onChange={(e) => handleQuestionTypeChange(question.id, e.target.value as any)}
                            className="w-full md:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                          >
                            <option value="rating">⭐ Star Rating</option>
                            <option value="choice">📝 Multiple Choice</option>
                            <option value="text">✍️ Paragraph Text</option>
                          </select>
                        </div>
                      </div>

                      {/* Question Body - Depending on Type */}
                      <div className="mb-6 pl-2">
                        
                        {/* Star Rating Layout */}
                        {question.type === 'rating' && (
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className="w-8 h-8 text-gray-200 fill-gray-100 hover:text-yellow-400 hover:fill-yellow-300 transition-colors cursor-pointer" 
                              />
                            ))}
                            <span className="text-xs text-gray-400 ml-3">5-Star Scale</span>
                          </div>
                        )}

                        {/* Paragraph Short Answer Layout */}
                        {question.type === 'text' && (
                          <div className="w-full md:w-2/3 py-2 border-b border-dashed border-gray-200 text-sm text-gray-400 select-none">
                            Respondents will type a short answer or description here.
                          </div>
                        )}

                        {/* Multiple Choice Option Layout */}
                        {question.type === 'choice' && (
                          <div className="space-y-3">
                            {question.options?.map((option, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-3 group/opt">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                <input 
                                  type="text" 
                                  value={option}
                                  onChange={(e) => handleOptionTextChange(question.id, optIdx, e.target.value)}
                                  className="text-sm font-medium text-gray-700 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none pb-0.5 transition-all flex-1 max-w-md"
                                />
                                {question.options && question.options.length > 1 && (
                                  <button 
                                    onClick={() => handleDeleteOption(question.id, optIdx)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity p-1 cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button 
                              onClick={() => handleAddOption(question.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-2 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Option
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Question Footer (Actions - Delete, Required Toggle) */}
                  <div className="pt-4 border-t border-gray-50 flex justify-end items-center gap-4 text-gray-400">
                    <button 
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={questions.length === 1}
                      className="flex items-center gap-1.5 text-xs font-semibold hover:text-red-500 disabled:opacity-40 transition-colors p-1 cursor-pointer"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                    
                    <div className="h-4 w-px bg-gray-200"></div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-semibold">Required</span>
                      <input 
                        type="checkbox" 
                        checked={question.required}
                        onChange={() => handleToggleRequired(question.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </label>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Action Toolbar to Add Questions */}
          <div className="flex justify-center pt-2">
            <button 
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-200 hover:border-indigo-500 hover:text-indigo-600 rounded-2xl text-sm font-bold text-gray-500 bg-gray-50/50 hover:bg-indigo-50/10 transition-all cursor-pointer shadow-sm w-full md:w-auto justify-center"
            >
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Add Question
            </button>
          </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
