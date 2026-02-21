import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Code2,
  Brain,
  Shield,
  Cloud,
  Database,
  Terminal,
} from "lucide-react";

// Sample career path data for different specializations
const careerPaths = {
  web: {
    title: "Web Development",
    icon: Code2,
    color: "blue",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "CSIT, BIT, BCA or self‑taught",
        details:
          "Learn HTML, CSS, JavaScript, and a framework (React, Vue, Angular).",
      },
      {
        id: 2,
        title: "Skills",
        description: "Frontend, Backend, Databases",
        details: "Master a stack: MERN, LAMP, or Jamstack. Build projects.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Junior Developer, Intern",
        details: "Start as frontend, backend, or full‑stack intern.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "Senior Dev, Tech Lead",
        details: "Lead projects, mentor juniors, specialize in architecture.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "Architect, CTO",
        details:
          "Move into system design, management, or start your own agency.",
      },
    ],
  },
  ai: {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "purple",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "CSIT, Data Science, Maths",
        details: "Focus on statistics, linear algebra, and programming.",
      },
      {
        id: 2,
        title: "Skills",
        description: "Python, TensorFlow, Scikit‑learn",
        details:
          "Learn ML algorithms, data preprocessing, and model deployment.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Junior ML Engineer, Data Analyst",
        details: "Work on data pipelines, build simple models.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "ML Engineer, AI Specialist",
        details: "Optimize models, work on computer vision or NLP.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "AI Researcher, Lead Data Scientist",
        details: "Push boundaries, publish papers, lead teams.",
      },
    ],
  },
  cyber: {
    title: "Cybersecurity",
    icon: Shield,
    color: "red",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "CSIT, Networking, Certifications",
        details:
          "Learn network protocols, operating systems, and security basics.",
      },
      {
        id: 2,
        title: "Skills",
        description: "Ethical Hacking, Cryptography",
        details: "Master tools like Wireshark, Metasploit, and scripting.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Security Analyst, SOC Analyst",
        details: "Monitor systems, respond to incidents.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "Penetration Tester, Security Engineer",
        details: "Conduct security audits, design secure systems.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "CISO, Security Architect",
        details: "Lead security strategy, manage teams.",
      },
    ],
  },
  cloud: {
    title: "Cloud Computing",
    icon: Cloud,
    color: "sky",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "CSIT, Networking, Certifications",
        details: "Learn Linux, virtualization, and basic cloud concepts.",
      },
      {
        id: 2,
        title: "Skills",
        description: "AWS, Azure, Docker, Kubernetes",
        details: "Get certified, build cloud‑native apps.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Cloud Support Associate, Jr. DevOps",
        details: "Manage cloud resources, assist with deployments.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "Cloud Engineer, DevOps Lead",
        details: "Design infrastructure, automate everything.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "Cloud Architect, Head of Platform",
        details: "Define strategy, lead platform teams.",
      },
    ],
  },
  data: {
    title: "Data Science",
    icon: Database,
    color: "green",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "Statistics, CSIT, Data Science",
        details: "Learn probability, databases, and programming.",
      },
      {
        id: 2,
        title: "Skills",
        description: "Python, SQL, Pandas, Visualization",
        details: "Clean data, build dashboards, apply ML.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Data Analyst, Jr. Data Scientist",
        details: "Analyze data, create reports, build simple models.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "Data Scientist, ML Engineer",
        details: "Build predictive models, deploy solutions.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "Chief Data Officer, AI Lead",
        details: "Drive data strategy, lead teams.",
      },
    ],
  },
  devops: {
    title: "DevOps",
    icon: Terminal,
    color: "orange",
    steps: [
      {
        id: 1,
        title: "Education",
        description: "CSIT, Linux, Scripting",
        details: "Learn OS, networking, and automation basics.",
      },
      {
        id: 2,
        title: "Skills",
        description: "CI/CD, Docker, Kubernetes, Monitoring",
        details: "Master Jenkins, GitLab CI, Prometheus.",
      },
      {
        id: 3,
        title: "Entry Jobs",
        description: "Junior DevOps, Build Engineer",
        details: "Maintain CI pipelines, manage deployments.",
      },
      {
        id: 4,
        title: "Growth Roles",
        description: "DevOps Engineer, SRE",
        details: "Design infrastructure, improve reliability.",
      },
      {
        id: 5,
        title: "Future Scope",
        description: "Platform Engineer, Infrastructure Lead",
        details: "Lead platform initiatives, architect systems.",
      },
    ],
  },
};

const CareerPaths = () => {
  const [selectedPath, setSelectedPath] = useState("web");
  const [hoveredStep, setHoveredStep] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  const path = careerPaths[selectedPath];
  const Icon = path.icon;

  // Color mapping
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      gradient: "from-blue-500 to-purple-500",
      light: "bg-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      light: "bg-purple-100",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      gradient: "from-red-500 to-orange-500",
      light: "bg-red-100",
    },
    sky: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-600",
      gradient: "from-sky-500 to-blue-500",
      light: "bg-sky-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      gradient: "from-green-500 to-teal-500",
      light: "bg-green-100",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      light: "bg-orange-100",
    },
  };

  const colors = colorClasses[path.color] || colorClasses.blue;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Your Career Path in{" "}
          <span
            className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
          >
            {path.title}
          </span>
        </h1>
        <p className="text-gray-600 text-lg">
          Visualize the journey from education to future opportunities. Choose a
          specialization below.
        </p>
      </div>

      {/* Specialization selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(careerPaths).map(([key, p]) => {
          const IconComponent = p.icon;
          const isSelected = selectedPath === key;
          const color = colorClasses[p.color] || colorClasses.blue;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedPath(key);
                setSelectedStep(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                isSelected
                  ? `${color.bg} ${color.border} ${color.text} shadow-md scale-105`
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <IconComponent size={18} />
              <span className="text-sm font-medium">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Path steps visual */}
      <div className="relative mt-12">
        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            <motion.div
              className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 -z-10"
              initial={{ width: "0%" }}
              animate={{ width: `${(path.steps.length - 1) * 25}%` }} // approximate, better to use percentage based on active step
              transition={{ duration: 0.5 }}
            />

            {path.steps.map((step, index) => {
              const isHovered = hoveredStep === step.id;
              const isSelected = selectedStep === step.id;
              return (
                <motion.div
                  key={step.id}
                  className="flex-1 text-center relative"
                  onHoverStart={() => setHoveredStep(step.id)}
                  onHoverEnd={() => setHoveredStep(null)}
                  onClick={() => setSelectedStep(step.id)}
                >
                  {/* Node */}
                  <motion.div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center cursor-pointer relative z-10 transition-all ${
                      isSelected
                        ? `bg-gradient-to-r ${colors.gradient} text-white scale-110`
                        : isHovered
                          ? `${colors.light} ${colors.text} scale-105`
                          : `bg-white border-2 ${colors.border} ${colors.text}`
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl font-bold">{step.id}</span>
                  </motion.div>

                  {/* Step title */}
                  <h3 className="mt-3 font-semibold text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500">{step.description}</p>

                  {/* Arrow for next step (except last) */}
                  {index < path.steps.length - 1 && (
                    <ChevronRight className="absolute top-6 -right-3 w-6 h-6 text-gray-300" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical stack */}
        <div className="md:hidden space-y-6">
          {path.steps.map((step, index) => {
            const isHovered = hoveredStep === step.id;
            const isSelected = selectedStep === step.id;
            return (
              <motion.div
                key={step.id}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${colors.gradient} text-white`
                    : isHovered
                      ? `${colors.bg} ${colors.border}`
                      : "bg-white border-gray-200"
                }`}
                onHoverStart={() => setHoveredStep(step.id)}
                onHoverEnd={() => setHoveredStep(null)}
                onClick={() => setSelectedStep(step.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-white/20 text-white" : colors.bg
                    }`}
                  >
                    <span className="font-bold">{step.id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p
                      className={`text-sm ${isSelected ? "text-white/80" : "text-gray-600"}`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail panel for selected step */}
        <AnimatePresence mode="wait">
          {selectedStep && (
            <motion.div
              key={selectedStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-8 p-6 rounded-xl border ${colors.border} bg-white shadow-lg`}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {path.steps.find((s) => s.id === selectedStep)?.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {path.steps.find((s) => s.id === selectedStep)?.details}
              </p>
              <div className="flex justify-end">
                <Link
                  to="/register"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${colors.gradient} text-white text-sm font-medium hover:shadow-lg transition-shadow`}
                >
                  Start this path
                  <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Ready to follow this path? Create a free account to track your
          progress.
        </p>
        <Link
          to="/register"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
        >
          Join VISION for Free
        </Link>
      </div>
    </div>
  );
};

export default CareerPaths;
