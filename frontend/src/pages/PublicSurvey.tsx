import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export function PublicSurvey() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      alert('Failed to submit survey.');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading survey...</div>;
  if (!survey) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Survey not found.</div>;
  
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
          {survey.sections?.map((section: any) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">{section.title}</h2>
              <div className="space-y-8">
                {section.questions?.map((question: any) => (
                  <div key={question.id} className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-800">
                      {question.label} {question.required && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="text" 
                      required={question.required}
                      placeholder="Your answer..."
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-colors">
              Submit Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
