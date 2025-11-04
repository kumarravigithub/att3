import { useState, useCallback } from 'react';

const TABS = [
    { id: 'LOs', label: 'Learning Outcomes' },
    { id: 'Plan', label: 'Lesson Plan' },
    { id: 'Activities', label: 'Activities' },
    { id: 'Assessments', label: 'Assessments' },
    { id: 'Gaps', label: 'Learning Gaps' },
];

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h3 className="text-xl font-bold text-slate-700 mb-4">{title}</h3>
        {children}
    </div>
);

export const ResultsDisplay = ({ content, fileName, onReset }) => {
  const [activeTab, setActiveTab] = useState('LOs');

  const formatContentForDownload = useCallback(() => {
    let text = `Educational Plan for ${fileName}\n\n`;
    text += "=============================\n";
    text += "1. LEARNING OUTCOMES\n";
    text += "=============================\n";
    content.learningOutcomes.forEach((lo, i) => text += `${i + 1}. ${lo}\n`);
    
    text += "\n\n=============================\n";
    text += "2. LESSON PLAN\n";
    text += "=============================\n";
    content.lessonPlan.forEach(step => {
        text += `\nStep ${step.step}: ${step.title} (${step.duration})\n`;
        text += `   - ${step.description}\n`;
    });

    text += "\n\n=============================\n";
    text += "3. ACTIVITIES\n";
    text += "=============================\n";
    content.activities.forEach(activity => {
        text += `\n- ${activity.title}\n`;
        text += `  Description: ${activity.description}\n`;
        if(activity.materials && activity.materials.length > 0) {
           text += `  Materials: ${activity.materials.join(', ')}\n`;
        }
    });

    text += "\n\n=============================\n";
    text += "4. ASSESSMENT TESTS\n";
    text += "=============================\n";
    content.assessmentTests.forEach(test => {
        text += `\n- ${test.type}: ${test.description}\n`;
        if (test.questions && test.questions.length > 0) {
          test.questions.forEach((q, i) => text += `  ${i+1}. ${q}\n`);
        }
    });

    text += "\n\n=============================\n";
    text += "5. LEARNING GAPS\n";
    text += "=============================\n";
    content.learningGaps.forEach(gap => {
        text += `\n- Gap: ${gap.gap}\n`;
        text += `  Identification: ${gap.identificationMethod}\n`;
        text += `  Remedial Action: ${gap.remedialAction}\n`;
    });

    return text;
  }, [content, fileName]);

  const handleDownload = useCallback(() => {
    const textContent = formatContentForDownload();
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AnyTimeTeacher-${fileName.replace('.pdf', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fileName, formatContentForDownload]);

  const renderContent = () => {
    switch (activeTab) {
      case 'LOs':
        return (
          <SectionCard title="Learning Outcomes">
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              {content.learningOutcomes.map((lo, i) => <li key={i}>{lo}</li>)}
            </ul>
          </SectionCard>
        );
      case 'Plan':
        return (
          <SectionCard title="Lesson Plan">
            <div className="space-y-4">
              {content.lessonPlan.map((step) => (
                <div key={step.step} className="p-4 border-l-4 border-blue-500 bg-slate-50 rounded-r-md">
                  <p className="font-semibold text-blue-700">{step.step}. {step.title} <span className="text-sm font-normal text-slate-500 ml-2">({step.duration})</span></p>
                  <p className="text-slate-600 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      case 'Activities':
          return (
              <SectionCard title="Activities">
                  <div className="grid gap-4 md:grid-cols-2">
                      {content.activities.map((activity, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                              <p className="font-semibold text-slate-800">{activity.title}</p>
                              <p className="text-slate-600 mt-1 text-sm">{activity.description}</p>
                              {activity.materials && activity.materials.length > 0 && (
                                <p className="text-xs text-slate-500 mt-2">
                                  <strong>Materials:</strong> {activity.materials.join(', ')}
                                </p>
                              )}
                          </div>
                      ))}
                  </div>
              </SectionCard>
          );
      case 'Assessments':
          return (
              <SectionCard title="Assessment Strategies">
                  <div className="space-y-4">
                      {content.assessmentTests.map((test, i) => (
                          <div key={i} className="p-4 border rounded-md">
                              <p className="font-semibold">{test.type}: <span className="font-normal">{test.description}</span></p>
                              {test.questions && test.questions.length > 0 && (
                                <ul className="list-decimal list-inside mt-2 space-y-1 text-slate-600 text-sm">
                                  {test.questions.map((q, qi) => <li key={qi}>{q}</li>)}
                                </ul>
                              )}
                          </div>
                      ))}
                  </div>
              </SectionCard>
          );
      case 'Gaps':
          return (
              <SectionCard title="Learning Gap Identification">
                  <div className="space-y-4">
                      {content.learningGaps.map((gap, i) => (
                          <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="font-semibold text-yellow-800">{gap.gap}</p>
                              <p className="text-sm text-yellow-700 mt-1"><strong>How to Spot:</strong> {gap.identificationMethod}</p>
                              <p className="text-sm text-yellow-700 mt-1"><strong>How to Fix:</strong> {gap.remedialAction}</p>
                          </div>
                      ))}
                  </div>
              </SectionCard>
          );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Your Educational Plan is Ready!</h2>
            <p className="text-slate-500">Generated from <span className="font-semibold text-slate-600">{fileName}</span></p>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
            <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                Download Plan
            </button>
            <button onClick={onReset} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                Start Over
            </button>
        </div>

        <div className="sticky top-0 bg-slate-50 py-2 z-10">
            <div className="flex flex-wrap justify-center border-b border-slate-200">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 text-sm sm:px-4 sm:py-3 font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-slate-500 hover:text-blue-500'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="mt-2">{renderContent()}</div>
    </div>
  );
};

