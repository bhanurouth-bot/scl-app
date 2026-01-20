import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const PerformanceChart = ({ marks }) => {
  if (!marks || marks.length === 0) return <div className="text-slate-500 text-sm text-center py-10">No exam data available.</div>;

  // Process data to average scores by Subject (in case of multiple exams)
  // or just filter for the latest exam. Let's average for a "General Performance" view.
  const subjectMap = {};
  
  marks.forEach(m => {
    if (!subjectMap[m.subject_name]) {
      subjectMap[m.subject_name] = { subject: m.subject_name, total: 0, count: 0, fullMark: 100 };
    }
    subjectMap[m.subject_name].total += parseFloat(m.score);
    subjectMap[m.subject_name].count += 1;
  });

  const data = Object.values(subjectMap).map(s => ({
    subject: s.subject,
    A: Math.round(s.total / s.count),
    fullMark: 100
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#60a5fa' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;