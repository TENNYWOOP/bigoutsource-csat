import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, Edit2, Trash2, ArrowLeft, Save, Send, Building, Link as LinkIcon, CheckCircle2, Star, PauseCircle, PlayCircle, X, GripHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { motion } from 'motion/react';

interface Question {
  id: string;
  type_id: string;
  label: string;
  required?: boolean;
  section_id: string;
  question_order: number;
  isFixed?: boolean;
}

interface Section {
  id: string;
  title: string;
  order: number;
}

export function Surveys() {
  const { user, canManage, isGlobal } = useAuth();
  const toast = useToast();
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States
  const [isCreating, setIsCreating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [viewingSurvey, setViewingSurvey] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
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
    { id: 's1', title: 'Transaction Details', order: 1 },
    { id: 's2', title: 'Feedback', order: 2 }
  ]);
  
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', type_id: 'date', label: 'Date of Transaction', required: true, section_id: 's1', question_order: 1, isFixed: true },
    { id: 'q2', type_id: 'short-text', label: 'Full Name', required: true, section_id: 's1', question_order: 2, isFixed: true },
    { id: 'q3', type_id: 'personnel-dropdown', label: 'Name of IT Personnel', required: true, section_id: 's1', question_order: 3, isFixed: true },
    { id: 'q4', type_id: 'short-text', label: 'Ticket Number', required: true, section_id: 's1', question_order: 4, isFixed: true },
    { id: 'q5', type_id: 'short-text', label: 'Email of the person who is submitting the survey', required: true, section_id: 's1', question_order: 5, isFixed: true },
    { id: 'q_rating1', type_id: 'rating', label: 'Please rate your overall experience with the IT support you received.', required: true, section_id: 's2', question_order: 1, isFixed: false },
    { id: 'q_rating2', type_id: 'rating', label: 'Please rate the timeliness of the response and resolution.', required: true, section_id: 's2', question_order: 2, isFixed: false },
    { id: 'q_rating3', type_id: 'rating', label: 'Please rate the professionalism and clarity of communication.', required: true, section_id: 's2', question_order: 3, isFixed: false },
    { id: 'q_rating4', type_id: 'rating', label: 'Was the solution clearly explained to you?', required: true, section_id: 's2', question_order: 4, isFixed: false },
    { id: 'q6', type_id: 'paragraph', label: 'Please share any feedback or suggestions to help improve our services', required: true, section_id: 's2', question_order: 5, isFixed: true }
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

  const handleCloseCreator = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCreating(false);
      setIsClosing(false);
      setEditingSurveyId(null);
    }, 200);
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
    
    const feedbackIdx = questions.findIndex(q => q.section_id === sectionId && q.isFixed && q.label.toLowerCase().includes('feedback'));
    if (feedbackIdx !== -1) {
      const newQuestions = [...questions];
      newQuestions.splice(feedbackIdx, 0, newQ);
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, newQ]);
    }
    
    setActiveQuestionId(newQ.id);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(q => q.id === active.id);
        const newIndex = items.findIndex(q => q.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          if (items[oldIndex].isFixed || items[newIndex].isFixed) {
            return items;
          }
          const reordered = arrayMove(items, oldIndex, newIndex);
          // update question_order
          return reordered.map((q, idx) => ({...q, question_order: idx + 1}));
        }
        return items;
      });
    }
  };



  const resetForm = () => {
    setIsCreating(false);
    setEditingSurveyId(null);
    setSurveyTitle('');
    setSurveyDesc('');
    setSections([
      { id: 's1', title: 'Transaction Details', order: 1 },
      { id: 's2', title: 'Feedback', order: 2 }
    ]);
    setQuestions([
      { id: 'q1', type_id: 'date', label: 'Date of Transaction', required: true, section_id: 's1', question_order: 1, isFixed: true },
      { id: 'q2', type_id: 'short-text', label: 'Full Name', required: true, section_id: 's1', question_order: 2, isFixed: true },
      { id: 'q3', type_id: 'personnel-dropdown', label: 'Name of IT Personnel', required: true, section_id: 's1', question_order: 3, isFixed: true },
      { id: 'q4', type_id: 'short-text', label: 'Ticket Number', required: true, section_id: 's1', question_order: 4, isFixed: true },
      { id: 'q5', type_id: 'short-text', label: 'Email of the person who is submitting the survey', required: true, section_id: 's1', question_order: 5, isFixed: true },
      { id: 'q_rating1', type_id: 'rating', label: 'Please rate your overall experience with the IT support you received.', required: true, section_id: 's2', question_order: 1, isFixed: false },
      { id: 'q_rating2', type_id: 'rating', label: 'Please rate the timeliness of the response and resolution.', required: true, section_id: 's2', question_order: 2, isFixed: false },
      { id: 'q_rating3', type_id: 'rating', label: 'Please rate the professionalism and clarity of communication.', required: true, section_id: 's2', question_order: 3, isFixed: false },
      { id: 'q_rating4', type_id: 'rating', label: 'Was the solution clearly explained to you?', required: true, section_id: 's2', question_order: 4, isFixed: false },
      { id: 'q6', type_id: 'paragraph', label: 'Please share any feedback or suggestions to help improve our services', required: true, section_id: 's2', question_order: 5, isFixed: true }
    ]);
  };

  const handleLaunchCampaign = async (status: 'ACTIVE' | 'DRAFT') => {
    if (!surveyTitle.trim()) {
      toast.error('Please enter a survey title.');
      return;
    }

    const targetDept = isGlobal() ? selectedDeptId : user?.department_id;
    if (!targetDept) {
      toast.error('Please select a target department for this survey.');
      return;
    }

    const payloadSections = sections.map(s => ({
      title: s.title,
      section_order: s.order,
      questions: questions.filter(q => q.section_id === s.id).map((q, idx) => ({
        type_id: q.type_id,
        label: q.label,
        required: q.required,
        question_order: idx + 1,
        config: q.isFixed ? JSON.stringify({ isFixed: true }) : '{}'
      }))
    }));

    const payload = {
      title: surveyTitle.trim(),
      description: surveyDesc.trim(),
      status,
      department_id: isGlobal() ? selectedDeptId : user?.department_id,
      sections: payloadSections
    };

    try {
      if (editingSurveyId) {
        await api.put(`/surveys/${editingSurveyId}`, payload);
        toast.success('Survey campaign updated successfully!');
      } else {
        await api.post('/surveys', payload);
        toast.success(status === 'ACTIVE' ? 'Survey campaign launched successfully!' : 'Survey campaign draft saved!');
      }

      const updated = await api.get('/surveys');
      setCampaignsList(updated);
      setIsClosing(true);
      setTimeout(() => {
        resetForm();
        setIsClosing(false);
      }, 200);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save survey campaign');
    }
  };

  const executeDeleteCampaign = async () => {
    if (!deletingSurveyId) return;
    try {
      await api.delete(`/surveys/${deletingSurveyId}`);
      setCampaignsList(campaignsList.filter(c => c.id !== deletingSurveyId));
      if (viewingSurvey?.id === deletingSurveyId) setViewingSurvey(null);
      toast.success('Survey campaign deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete survey campaign');
    } finally {
      setDeletingSurveyId(null);
      setDeleteConfirmationText('');
    }
  };

  const handleToggleStatus = async () => {
    if (!viewingSurvey) return;
    const newStatus = viewingSurvey.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/surveys/${viewingSurvey.id}/status`, { status: newStatus });
      toast.success(`Survey ${newStatus === 'INACTIVE' ? 'deactivated' : 'reactivated'} successfully!`);
      setViewingSurvey({ ...viewingSurvey, status: newStatus });
      const updated = await api.get('/surveys');
      setCampaignsList(updated);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update survey status');
    }
  };

  const copyToClipboard = (linkId: string) => {
    const link = `${window.location.origin}/s/${linkId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(linkId);
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
      s.questions?.sort((a: any, b: any) => a.question_order - b.question_order).forEach((q: any) => {
        let isFixed = false;
        try {
          const config = JSON.parse(q.config || '{}');
          isFixed = !!config.isFixed;
        } catch (e) {}

        newQuestions.push({
          id: `q_${q.id}`,
          type_id: q.type_id,
          label: q.label,
          required: q.required,
          section_id: sId,
          question_order: q.question_order,
          isFixed
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
      'StarRating': () => {
        const [val, setVal] = useState(0);
        return (
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = val >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setVal(star)}
                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star 
                    strokeWidth={1.5}
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      isSelected 
                        ? "text-amber-500 fill-amber-500" 
                        : "text-slate-400 fill-transparent hover:text-amber-400 hover:fill-amber-100"
                    )}
                  />
                </button>
              );
            })}
            <span className="text-xs font-semibold text-gray-400 ml-2 select-none">Rating Scale</span>
          </div>
        );
      },
      'DateInput': () => (
        <div className="w-full max-w-xs px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 dark:text-slate-400 select-none flex justify-between items-center dark:border-slate-700/60">
          <span>MM/DD/YYYY</span>
          <span className="text-xs">📅</span>
        </div>
      ),
      'PersonnelSelect': () => (
        <div className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 dark:text-slate-400 flex justify-between items-center dark:border-slate-700/60">
          <span>Select personnel...</span>
          <span className="text-[10px]">▼</span>
        </div>
      ),
      'Textarea': () => (
        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 dark:text-slate-400 select-none min-h-[80px] dark:border-slate-700/60">
          Respondents will type a paragraph here.
        </div>
      ),
      'TextInput': () => (
        <div className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 dark:text-slate-400 select-none dark:border-slate-700/60">
          Respondents will type a short answer here.
        </div>
      )
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
                onClick={() => copyToClipboard(viewingSurvey.slug || viewingSurvey.id)} 
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
              >
                {copiedId === (viewingSurvey.slug || viewingSurvey.id) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                {copiedId === (viewingSurvey.slug || viewingSurvey.id) ? <span className="text-emerald-600">Copied!</span> : 'Copy Public Link'}
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
                  {viewingSurvey.status !== 'DRAFT' && canManage() && (
                    <button 
                      onClick={handleToggleStatus} 
                      className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors",
                        viewingSurvey.status === 'ACTIVE' 
                          ? "text-amber-600 bg-amber-50 hover:bg-amber-100" 
                          : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      )}
                    >
                      {viewingSurvey.status === 'ACTIVE' ? (
                        <><PauseCircle className="w-4 h-4" /> Deactivate Survey</>
                      ) : (
                        <><PlayCircle className="w-4 h-4" /> Reactivate Survey</>
                      )}
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
                    <th className="p-4 font-semibold uppercase text-xs">Answers Preview</th>
                    <th className="p-4 font-semibold uppercase text-xs text-right">Actions</th>
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
                          {r.answers.slice(0, 2).map((a: any) => (
                            <div key={a.id} className="text-xs">
                              <span className="font-semibold text-gray-700">{a.question?.label}:</span> <span className="text-gray-600">{a.value}</span>
                            </div>
                          ))}
                          {r.answers.length > 2 && (
                            <div className="text-xs text-gray-400 italic">+{r.answers.length - 2} more answers...</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right align-top">
                        <button 
                          onClick={() => setSelectedResponse(r)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedResponse && (
          <div className="fixed inset-0 z-50 flex flex-col p-4 bg-gray-50 overflow-y-auto" onClick={() => setSelectedResponse(null)}>
            <div className="w-full max-w-3xl mx-auto my-auto py-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Response Details</h3>
                <button onClick={() => setSelectedResponse(null)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6" onClick={e => e.stopPropagation()}>
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="h-3 bg-blue-600"></div>
                  <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{viewingSurvey.title}</h1>
                    {viewingSurvey.description && <p className="text-gray-600 mb-6">{viewingSurvey.description}</p>}
                    
                    <div className="flex gap-4 border-t border-gray-100 pt-4">
                      <div className="text-sm">
                        <span className="text-gray-500 font-semibold">Response ID: </span>
                        <span className="font-mono text-gray-900">{selectedResponse.id.split('-')[0]}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500 font-semibold">Submitted: </span>
                        <span className="text-gray-900">{new Date(selectedResponse.submitted_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {viewingSurvey.sections?.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                      {s.title}
                    </h2>
                    <div className="space-y-8">
                      {s.questions?.map((question: any) => {
                        const answer = selectedResponse.answers.find((a: any) => a.question_id === question.id);
                        const value = answer ? answer.value : '';
                        
                        return (
                          <div key={question.id} className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-800">
                              {question.label} {question.required && <span className="text-red-500">*</span>}
                            </label>
                            
                            {question.type?.name === 'rating' ? (
                              <div className="flex items-center gap-1.5 py-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    strokeWidth={1.5}
                                    className={cn(
                                      "w-8 h-8",
                                      Number(value) >= star 
                                        ? "text-amber-500 fill-amber-500" 
                                        : "text-slate-400 fill-transparent"
                                    )}
                                  />
                                ))}
                                {value && (
                                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-3 select-none">
                                    Score: {value} / 5
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className={cn(
                                "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900",
                                question.type?.name === 'paragraph' ? "min-h-[100px] whitespace-pre-wrap" : ""
                              )}>
                                {value || <span className="text-gray-400 italic">No answer provided</span>}
                              </div>
                            )}
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

        {/* Delete Confirmation Modal */}
        {deletingSurveyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
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
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Survey Campaign
            </motion.button>
          </div>
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
                campaign.status === 'INACTIVE' ? "bg-amber-50 text-amber-600" :
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
        <div 
          onClick={handleCloseCreator}
          className={cn(
            "fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-10 px-4 cursor-pointer",
            isClosing ? "animate-fade-out" : "animate-fade-in"
          )}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "bg-gray-50 rounded-2xl w-full max-w-4xl shadow-2xl relative border border-gray-200 pb-12 p-6 md:p-8 cursor-default",
              isClosing ? "animate-modal-exit" : "animate-modal-entry"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleCloseCreator} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button onClick={() => handleLaunchCampaign('DRAFT')} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white shadow-sm">
                  <Save className="w-4 h-4" /> Save as Draft
                </button>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button onClick={() => setIsCreating(false)} className="px-5 py-2 text-gray-500 font-semibold text-sm hover:text-gray-700">Cancel</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLaunchCampaign('ACTIVE')} 
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Launch Campaign
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500"></div>
                <div className="p-8">
                  <input type="text" placeholder="Survey Title" value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} className="w-full text-3xl font-bold text-gray-900 border-b border-transparent focus:border-indigo-600 focus:outline-none pb-2 transition-all" />
                  <input type="text" placeholder="Form description (optional)" value={surveyDesc} onChange={e => setSurveyDesc(e.target.value)} className="w-full text-sm text-gray-500 border-b border-transparent focus:border-indigo-600 focus:outline-none mt-4 pb-1 transition-all" />
                  
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <Building className="w-4 h-4" /> Target Department
                    </div>
                    {isGlobal() ? (
                      <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                        {user?.department?.name || departments.find(d => d.id === user?.department_id)?.name || 'Your Department'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {sections.map((section, index) => (
                <div key={section.id} className="relative">
                  {index > 0 && (
                    <div className="flex items-center gap-4 my-8">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        Page Break (Page {index + 1} of {sections.length})
                      </span>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="flex items-center gap-4 mt-8 mb-4">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Page 1 (Start)
                      </span>
                    </div>
                  )}
                  <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                      disabled={index <= 1}
                      className={cn("text-xl font-bold text-gray-800 border-b border-transparent focus:border-indigo-600 focus:outline-none", index <= 1 && "bg-transparent cursor-not-allowed")}
                    />
                    {index > 1 && (
                      <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete Section</button>
                    )}
                  </div>
                  
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={questions.filter(q => q.section_id === section.id).map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-6 mt-6">
                        {questions.filter(q => q.section_id === section.id).map((question, qIndex) => (
                          <SortableQuestionCard
                            key={question.id}
                            question={question}
                            index={qIndex}
                            sectionIndex={index}
                            isActive={activeQuestionId === question.id}
                            onActivate={() => setActiveQuestionId(question.id)}
                            onChangeLabel={(e: any) => setQuestions(questions.map(q => q.id === question.id ? { ...q, label: e.target.value } : q))}
                            onChangeType={(e: any) => setQuestions(questions.map(q => q.id === question.id ? { ...q, type_id: e.target.value } : q))}
                            onChangeRequired={(e: any) => setQuestions(questions.map(q => q.id === question.id ? { ...q, required: e.target.checked } : q))}
                            onDelete={() => handleDeleteQuestion(question.id)}
                            questionTypes={questionTypes}
                            renderConfigComponent={renderConfigComponent}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <div className="pt-4">
                    <button 
                      onClick={() => handleAddQuestion(section.id, index === 1 ? 'rating' : (questionTypes[0]?.id || 'short-text'))}
                      className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" /> Add Question to Section
                    </button>
                  </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-6">
                <button 
                  onClick={handleAddSection} 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border dark:border-slate-700/50 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function SortableQuestionCard({
  question,
  sectionIndex,
  isActive,
  onActivate,
  onChangeLabel,
  onChangeType,
  onChangeRequired,
  onDelete,
  questionTypes,
  renderConfigComponent
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: question.id,
    disabled: question.isFixed
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={onActivate} 
      className={cn("bg-white rounded-xl border transition-all shadow-sm overflow-hidden cursor-pointer group", isActive ? "border-indigo-600 ring-1 ring-indigo-500/10" : "border-gray-200", isDragging && "shadow-xl border-indigo-400 opacity-90 scale-[1.02]")}
    >
      <div className="p-6 relative">
        {isActive && <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600"></div>}
        
        {!question.isFixed && (
          <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripHorizontal className="w-5 h-5 text-gray-300 hover:text-gray-500" />
          </div>
        )}
        
        <div className={cn("flex justify-between items-start mb-6", !question.isFixed && "mt-2")}>
          <input 
            type="text" 
            value={question.label}
            placeholder="Enter your question here..."
            onChange={onChangeLabel}
            disabled={question.isFixed}
            className={cn("w-full font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none pb-1.5 text-base transition-colors", question.isFixed && "bg-transparent cursor-not-allowed text-gray-600 hover:border-transparent")}
          />
          <div className="flex items-center gap-2 ml-4">
            {!(question.isFixed || (sectionIndex === 1 && !question.isFixed)) && (
              <select 
                value={question.type_id}
                onChange={onChangeType}
                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer"
              >
                {questionTypes.map((qt: any) => <option key={qt.id} value={qt.id}>{qt.label}</option>)}
              </select>
            )}
            {!question.isFixed && (
              <div className="flex items-center border-l border-gray-100 pl-2 ml-2">
                <button onClick={(e: any) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete Question"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
        
        {renderConfigComponent(question.type_id)}
        
        <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-3">
          {question.isFixed ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <CheckCircle2 className="w-4 h-4" /> Required
            </span>
          ) : (
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-600">
              <input 
                type="checkbox" 
                checked={question.required} 
                onChange={onChangeRequired} 
              /> Required
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
