import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import projectsData from '../data/projects.json';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = ({ onProjectClick, theme }) => {
  const [filterTech, setFilterTech] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [focusedProjectIndex, setFocusedProjectIndex] = useState(-1);
  const dashboardRef = useRef(null);
  const projectRefs = useRef([]);

  const techStacks = ['All', ...new Set(projectsData.flatMap(project => project.tech))];

  const projectsWithDates = projectsData.map(project => ({
    ...project,
    date: project.id === 'project_amazon_reviews' ? '2024-01-15' :
          project.id === 'project_airbnb' ? '2024-03-10' :
          project.id === 'project_iveims' ? '2024-05-20' :
          project.id === 'project_blogai' ? '2024-07-30' :
          project.id === 'project_quantiq' ? '2025-01-01' :
          '2024-09-15'
  }));

  const sortedProjects = [...projectsWithDates].sort((a, b) => {
    if (sortBy === 'dateAsc') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'dateDesc') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'accuracyDesc') {
      return (b.metrics.accuracy || 0) - (a.metrics.accuracy || 0);
    } else if (sortBy === 'accuracyAsc') {
      return (a.metrics.accuracy || 0) - (b.metrics.accuracy || 0);
    }
    return 0;
  });

  const filteredProjects = filterTech === 'All'
    ? sortedProjects
    : sortedProjects.filter(project => project.tech.includes(filterTech));

  const totalProjects = projectsData.length;
  const averageMetrics = projectsData.reduce((acc, project) => {
    const metrics = Object.values(project.metrics);
    return metrics.reduce((sum, value, index) => {
      acc[index] = (acc[index] || 0) + value / totalProjects;
      return acc;
    }, acc);
  }, []);

  const metricNames = projectsData[0] ? Object.keys(projectsData[0].metrics) : [];
  const summaryStats = metricNames.map((name, index) => ({
    name: `Avg ${name}`,
    value: averageMetrics[index].toFixed(2)
  }));

  const renderChartPreview = (chartType, metrics) => {
    const chartData = Object.entries(metrics).map(([key, value]) => ({ name: key, value }));

    if (chartType === 'line') {
      return (
        <LineChart width={150} height={100} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
          <XAxis dataKey="name" stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <YAxis stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <Line type="monotone" dataKey="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} dot={false} />
        </LineChart>
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart width={150} height={100} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
          <XAxis dataKey="name" stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <YAxis stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <Bar dataKey="value" fill={theme === 'dark' ? '#00ff00' : '#000000'} />
        </BarChart>
      );
    } else if (chartType === 'scatter') {
      return (
        <ScatterChart width={150} height={100}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
          <XAxis type="number" dataKey="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <YAxis type="number" dataKey="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} hide />
          <Scatter data={chartData} fill={theme === 'dark' ? '#00ff00' : '#000000'} />
        </ScatterChart>
      );
    }
    return null;
  };

  // Keyboard navigation for dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredProjects.length === 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedProjectIndex(prev => {
          const newIndex = prev < filteredProjects.length - 1 ? prev + 1 : 0;
          projectRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          projectRefs.current[newIndex]?.focus();
          return newIndex;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedProjectIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredProjects.length - 1;
          projectRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          projectRefs.current[newIndex]?.focus();
          return newIndex;
        });
      } else if (e.key === 'Enter' && focusedProjectIndex >= 0) {
        onProjectClick(filteredProjects[focusedProjectIndex]);
      }
    };

    dashboardRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      dashboardRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredProjects, focusedProjectIndex, onProjectClick]);

  return (
    <div ref={dashboardRef} tabIndex={0} className="focus:outline-none">
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>Summary Stats</h3>
        <p className={theme === 'dark' ? 'text-green-500' : 'text-black'}>Total Projects: {totalProjects}</p>
        {summaryStats.map(stat => (
          <p key={stat.name} className={theme === 'dark' ? 'text-green-500' : 'text-black'}>{stat.name}: {stat.value}</p>
        ))}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className={`mr-2 ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>Filter by Tech:</label>
          <select
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className={`p-1 rounded ${theme === 'dark' ? 'bg-black border border-green-500 text-green-500' : 'bg-white border border-black text-black'}`}
          >
            {techStacks.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={`mr-2 ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`p-1 rounded ${theme === 'dark' ? 'bg-black border border-green-500 text-green-500' : 'bg-white border border-black text-black'}`}
          >
            <option value="default">Default</option>
            <option value="dateAsc">Date (Oldest First)</option>
            <option value="dateDesc">Date (Newest First)</option>
            <option value="accuracyAsc">Accuracy (Low to High)</option>
            <option value="accuracyDesc">Accuracy (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              ref={(el) => (projectRefs.current[index] = el)}
              tabIndex={0}
              className={`border p-4 rounded-lg cursor-pointer transition-colors focus:outline-none ${theme === 'dark' ? 'border-green-500 hover:bg-green-900 hover:bg-opacity-20' : 'border-black hover:bg-gray-100'} ${focusedProjectIndex === index ? (theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-gray-200') : ''}`}
              onClick={() => onProjectClick(project)}
              onFocus={() => setFocusedProjectIndex(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>{project.title}</h3>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>{project.description}</p>
              <div className="flex justify-center">
                {renderChartPreview(project.chart, project.metrics)}
              </div>
            </motion.div>
          ))
        ) : (
          <p className={theme === 'dark' ? 'text-green-500' : 'text-black'}>No projects match this filter.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;