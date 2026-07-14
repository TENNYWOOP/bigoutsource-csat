import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowLeft, Save, Send, Building, Link as LinkIcon, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

interface Question {
  id: string;
  type_id: string;
  label: string;
  required?: boolean;
  section_id: string;
  question_order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
}

export function Surveys() {
  const { user, canManage } = useAuth();
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States
  const [isCreating, setIsCreating] = useState(false);
  const [viewingSurvey, setViewingSurvey] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  
  // Deletion States
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Creator Form States
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [sections, setSections] = useState<Section[]>([
    { id: 's1', title: 'Respondent Information', order: 1 }
  ]);
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', type_id: 'short-text', label: 'Email Address', required: true, section_id: 's1', question_order: 1 }
  ]);

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>('q1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysData, deptData, qtData] = await Promise.all([
          api.get('/surveys'),
          api.get('/departments'),
          api.get('/question-types')
        ]);
        setCampaignsList(surveysData);
        setDepartments(deptData);
        if (deptData.length > 0) setSelectedDeptId(deptData[0].id);
        setQuestionTypes(qtData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchResponses = async (id: string) => {
    try {
      const data = await api.get(`/surveys/${id}/responses`);
      setSurveyResponses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewSurvey = async (survey: any) => {
    try {
      const fullSurvey = await api.get(`/surveys/${survey.id}`);
      setViewingSurvey(fullSurvey);
      setActiveTab('questions');
      fetchResponses(survey.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSection = () => {
    const newId = `s${Date.now()}`;
    setSections([...sections, { id: newId, title: 'New Section', order: sections.length + 1 }]);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    setQuestions(questions.filter(q => q.section_id !== id));
  };

  const handleAddQuestion = (sectionId: string, typeId: string) => {
    const newQ: Question = {
      id: `q${Date.now()}`,
      type_id: typeId,
      label: 'New Question',
      required: false,
      section_id: sectionId,
      question_order: questions.filter(q => q.section_id === sectionId).length + 1
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionId(newQ.id);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleLaunchCampaign = async (status: 'ACTIVE' | 'DRAFT') => {
    if (!surveyTitle.trim()) {
      alert('Please enter a survey title.');
      return;
    }

    const payloadSections = sections.map(s => ({
      title: s.title,
      section_order: s.order,
      questions: questions.filter(q => q.section_id === s.id).map(q => ({
        type_id: q.type_id,
        label: q.label,
        required: q.required,
        question_order: q.question_order
      }))
    }));

    const payload = {
      title: surveyTitle.trim(),
      description: surveyDesc.trim(),
      status,
      department_id: selectedDeptId,
      sections: payloadSections
    };

    try {
      if (editingSurveyId) {
        await api.put(`/surveys/${editingSurveyId}`, payload);
      } else {
        await api.post('/surveys', payload);
      }

      const updated = await api.get('/surveys');
      setCampaignsList(updated);
      setIsCreating(false);
      setEditingSurveyId(null);
      setSurveyTitle(''); setSurveyDesc('');
      setSections([{ id: 's1', title: 'Respondent Information', order: 1 }]);
      setQuestions([{ id: 'q1', type_id: 'short-text', label: 'Email Address', required: true, section_id: 's1', question_order: 1 }]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const executeDeleteCampaign = async () => {
    if (!deletingSurveyId) return;
    await api.delete(`/surveys/${deletingSurveyId}`);
    setCampaignsList(campaignsList.filter(c => c.id !== deletingSurveyId));
    if (viewingSurvey?.id === deletingSurveyId) setViewingSurvey(null);
    setDeletingSurveyId(null);
    setDeleteConfirmationText('');
  };

  const copyToClipboard = (id: string) => {
    const link = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditDraft = () => {
    if (!viewingSurvey) return;
    setEditingSurveyId(viewingSurvey.id);
    setSurveyTitle(viewingSurvey.title);
    setSurveyDesc(viewingSurvey.description || '');
    setSelectedDeptId(viewingSurvey.department_id);
    
    const newSections: Section[] = [];
    const newQuestions: Question[] = [];
    
    viewingSurvey.sections?.forEach((s: any) => {
      const sId = `s_${s.id}`;
      newSections.push({ id: sId, title: s.title, order: s.section_order });
      s.questions?.forEach((q: any) => {
        newQuestions.push({
          id: `q_${q.id}`,
          type_id: q.type_id,
          label: q.label,
          required: q.required,
          section_id: sId,
          question_order: q.question_order
        });
      });
    });
    
    setSections(newSections);
    setQuestions(newQuestions);
    setViewingSurvey(null);
    setIsCreating(true);
  };

  const renderConfigComponent = (typeId: string) => {
    const qt = questionTypes.find(t => t.id === typeId);
    if (!qt) return null;
    
    let config = { component: 'TextInput' };
    try { config = JSON.parse(qt.config_schema); } catch {}

    const ComponentRegistry: any = {
      'StarRating': () => <div className="text-gray-400 text-2xl">⭐⭐⭐⭐⭐ <span className="text-sm ml-2">Rating Scale</span></div>,
      'DateInput': () => <div className="py-2 border-b border-dashed border-gray-200 text-sm text-gray-400 select-none">MM/DD/YYYY</div>,
      'PersonnelSelect': () => <div className="py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 flex justify-between"><span>Select personnel...</span><span>▼</span></div>,
      'Textarea': () => <div className="py-2 border-b border-dashed border-gray-200 text-sm text-gray-400 select-none">Respondents will type a paragraph here.</div>,
      'TextInput': () => <div className="py-2 border-b border-dashed border-gray-200 text-sm text-gray-400 select-none">Respondents will type a short answer here.</div>
    };

    const Comp = ComponentRegistry[config.component] || ComponentRegistry['TextInput'];
    return <Comp />;
  };

  if (viewingSurvey) {
    return (
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setViewingSurvey(null)} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{viewingSurvey.title}</h2>
              <button 
                onClick={() => copyToClipboard(viewingSurvey.id)} 
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
              >
                {copiedId === viewingSurvey.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                {copiedId === viewingSurvey.id ? <span className="text-emerald-600">Copied!</span> : 'Copy Public Link'}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-1">Dept: {viewingSurvey.department?.name} • Status: {viewingSurvey.status}</p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('questions')}
            className={cn("px-6 py-3 font-semibold text-sm border-b-2 transition-colors", activeTab === 'questions' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Questions
          </button>
          <button 
            onClick={() => setActiveTab('responses')}
            className={cn("px-6 py-3 font-semibold text-sm border-b-2 transition-colors", activeTab === 'responses' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Responses ({surveyResponses.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'questions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Survey Structure</h3>
                <div className="flex gap-2">
                  {viewingSurvey.status === 'DRAFT' && canManage() && (
                    <button onClick={handleEditDraft} className="px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold rounded-lg flex items-center gap-2">
                      <Edit2 className="w-4 h-4" /> Edit Draft
                    </button>
                  )}
                  {canManage() && (
                    <button onClick={() => setDeletingSurveyId(viewingSurvey.id)} className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-lg flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Survey
                    </button>
                  )}
                </div>
              </div>
              {viewingSurvey.sections?.map((s: any) => (
                <div key={s.id} className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                  <h4 className="font-bold text-gray-900 mb-4">{s.title}</h4>
                  <ul className="space-y-3">
                    {s.questions.map((q: any) => (
                      <li key={q.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between">
                        <span className="font-medium text-gray-800">{q.label} {q.required && <span className="text-red-500">*</span>}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-semibold">{q.type?.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <th className="p-4 font-semibold uppercase text-xs">Date</th>
                    <th className="p-4 font-semibold uppercase text-xs">Response ID</th>
                    <th className="p-4 font-semibold uppercase text-xs">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {surveyResponses.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-400">No responses yet.</td></tr>
                  )}
                  {surveyResponses.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap align-top">{new Date(r.submitted_at).toLocaleDateString()}</td>
                      <td className="p-4 font-mono text-xs text-gray-500 align-top">{r.id.split('-')[0]}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          {r.answers.map((a: any) => (
                            <div key={a.id} className="text-xs">
                              <span className="font-semibold text-gray-700">{a.question?.label}:</span> <span className="text-gray-600">{a.value}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Survey Campaigns</h2>
          </div>
          <p className="text-gray-500 text-sm">Manage external customer response rules and survey layouts.</p>
        </div>
        
        {canManage() && (
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Launch Survey Campaign
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && campaignsList.map((campaign) => (
          <div 
            key={campaign.id} 
            onClick={() => handleViewSurvey(campaign)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col cursor-pointer hover:border-blue-200"
          >
            <div className="flex justify-between items-center mb-6">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                campaign.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" :
                campaign.status === 'DRAFT' ? "bg-gray-100 text-gray-600" :
                "bg-red-50 text-red-600"
              )}>
                {campaign.status}
              </span>
              <span className="text-xs font-medium text-gray-400">{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2">{campaign.title}</h3>
              <span className="inline-flex text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                Dept: {campaign.department?.name}
              </span>
            </div>
            
            <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responses</div>
                  <div className="font-bold text-gray-900">{campaign._count?.responses || 0}</div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-gray-50 rounded-2xl w-full max-w-4xl shadow-2xl relative border border-gray-200 pb-12 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => { setIsCreating(false); setEditingSurveyId(null); }} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button onClick={() => handleLaunchCampaign('DRAFT')} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white shadow-sm">
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                <button onClick={() => handleLaunchCampaign('ACTIVE')} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm">
                  <Send className="w-4 h-4" /> Launch Campaign
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="p-8">
                  <input type="text" placeholder="Survey Title" value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} className="w-full text-3xl font-bold text-gray-900 border-b border-transparent focus:border-indigo-600 focus:outline-none pb-2 transition-all" />
                  <input type="text" placeholder="Form description (optional)" value={surveyDesc} onChange={e => setSurveyDesc(e.target.value)} className="w-full text-sm text-gray-500 border-b border-transparent focus:border-indigo-600 focus:outline-none mt-4 pb-1 transition-all" />
                  
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <Building className="w-4 h-4" /> Target Department
                    </div>
                    <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {sections.map(section => (
                <div key={section.id} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                      className="text-xl font-bold text-gray-800 border-b border-transparent focus:border-indigo-600 focus:outline-none"
                    />
                    <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete Section</button>
                  </div>
                  
                  {questions.filter(q => q.section_id === section.id).map(question => {
                    const isActive = activeQuestionId === question.id;
                    const qType = questionTypes.find(t => t.id === question.type_id);
                    
                    return (
                      <div key={question.id} onClick={() => setActiveQuestionId(question.id)} className={cn("bg-white rounded-xl border transition-all shadow-sm overflow-hidden cursor-pointer", isActive ? "border-indigo-600 ring-1 ring-indigo-500/10" : "border-gray-200")}>
                        <div className="p-6 relative">
                          {isActive && <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600"></div>}
                          <div className="flex justify-between items-start mb-6">
                            <input 
                              type="text" 
                              value={question.label}
                              onChange={(e) => setQuestions(questions.map(q => q.id === question.id ? { ...q, label: e.target.value } : q))}
                              className="w-full font-bold text-gray-800 border-b border-transparent focus:border-indigo-500 focus:outline-none pb-1.5 text-base"
                            />
                            <div className="flex items-center gap-2 ml-4">
                              <select 
                                value={question.type_id}
                                onChange={e => setQuestions(questions.map(q => q.id === question.id ? { ...q, type_id: e.target.value } : q))}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-500"
                              >
                                {questionTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.label}</option>)}
                              </select>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(question.id); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          
                          {/* Config-driven Dynamic Renderer */}
                          {renderConfigComponent(question.type_id)}
                          
                          <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={question.required} onChange={e => setQuestions(questions.map(q => q.id === question.id ? { ...q, required: e.target.checked } : q))} /> Required
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4">
                    <button 
                      onClick={() => handleAddQuestion(section.id, questionTypes[0]?.id || 'short-text')}
                      className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" /> Add Question to Section
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-6">
                <button onClick={handleAddSection} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Add New Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSurveyId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Survey</h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. All responses associated with this survey will be permanently deleted.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-gray-900 select-none bg-gray-100 px-1.5 py-0.5 rounded">{viewingSurvey?.title}</span> to confirm.
              </label>
              <input 
                type="text" 
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Survey title..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setDeletingSurveyId(null); setDeleteConfirmationText(''); }} 
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteCampaign}
                disabled={deleteConfirmationText !== viewingSurvey?.title}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
