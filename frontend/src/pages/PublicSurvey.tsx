import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function PublicSurvey() {
  const { id } = useParams();
  const toast = useToast();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await api.get(`/surveys/${id}`);
        setSurvey(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSurvey();
  }, [id]);

  const validateCurrentSection = () => {
    const currentSection = survey?.sections?.[currentSectionIndex];
    if (!currentSection) return true;
    for (const question of currentSection.questions || []) {
      if (question.required && !answers[question.id]?.trim()) {
        toast.error(`Please answer the required question: "${question.label}"`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentSectionIndex(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentSectionIndex(i => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentSection()) return;

    if (currentSectionIndex < (survey?.sections?.length || 1) - 1) {
      setCurrentSectionIndex(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        question_id: qId,
        value: answers[qId]
      }));
      
      await api.post(`/surveys/${id}/responses`, {
        metadata: { platform: 'web' },
        answers: formattedAnswers
      });
      setSubmitted(true);
      toast.success('Survey response submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit survey.');
    }
  };

  const renderQuestionInput = (question: any) => {
    const value = answers[question.id] || '';
    const onChange = (val: string) => setAnswers(prev => ({ ...prev, [question.id]: val }));

    switch (question.type_id) {
      case 'paragraph':
        return (
          <textarea
            placeholder="Type your response here..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 min-h-[100px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'personnel-dropdown':
        const personnelList = survey?.department?.users || [];
        return (
          <select
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">-- Select Personnel --</option>
            {personnelList.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = Number(value) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(String(star))}
                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    strokeWidth={1.5}
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isSelected 
                        ? "text-amber-500 fill-amber-500" 
                        : "text-slate-400 fill-transparent hover:text-amber-400 hover:fill-amber-100"
                    )}
                  />
                </button>
              );
            })}
            {value && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full ml-3 select-none">
                Score: {value} / 5
              </span>
            )}
          </div>
        );
      case 'short-text':
      default:
        return (
          <input
            type="text"
            placeholder="Your answer..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading survey...</div>;
  if (!survey) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Survey not found.</div>;
  
  if (survey.status === 'INACTIVE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">!</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Closed</h2>
          <p className="text-gray-500">This survey is no longer accepting responses. Thank you!</p>
        </div>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500">Your response has been successfully submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-3 bg-blue-600"></div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{survey.title}</h1>
            {survey.description && <p className="text-gray-600">{survey.description}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.sections?.[currentSectionIndex] && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                {survey.sections[currentSectionIndex].title}
              </h2>
              <div className="space-y-8">
                {survey.sections[currentSectionIndex].questions?.map((question: any) => (
                  <div key={question.id} className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-800">
                      {question.label} {question.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderQuestionInput(question)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            {currentSectionIndex > 0 ? (
              <button 
                type="button" 
                onClick={handleBack} 
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Previous Page
              </button>
            ) : <div></div>}

            <div className="flex gap-4">
              {currentSectionIndex < (survey.sections?.length || 1) - 1 && (
                <button 
                  key="next-btn"
                  type="button" 
                  onClick={handleNext} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors"
                >
                  Next Page
                </button>
              )}
              
              {currentSectionIndex === (survey.sections?.length || 1) - 1 && (
                <button 
                  key="submit-btn"
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors"
                >
                  Submit Survey
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
