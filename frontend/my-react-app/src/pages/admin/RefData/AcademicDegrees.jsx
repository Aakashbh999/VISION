import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academicDegreesApi } from "../../../services/admin";
import { toast } from "react-toastify";
import AdminTable from "../../../components/admin_ui/AdminTable";
import AdminConfirmModal from "../../../components/ui/AdminConfirmModal";
import { Plus, CheckCircle, XCircle, AlertTriangle, X, Eye } from "lucide-react";

const AcademicDegrees = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  // Basic Form State
  const [formData, setFormData] = useState({
    degree_code: "", full_name: "", university: "", duration: "", 
    focus_area: "", is_public: true
  });

  // Structured Form States
  const [eligibilityData, setEligibilityData] = useState({
    level: "", stream: "", subjects: "", minAggregate: "", aLevelEquivalent: ""
  });
  const [legacyEligibility, setLegacyEligibility] = useState("");
  const [isLegacyEligibility, setIsLegacyEligibility] = useState(false);
  
  const [admissionSteps, setAdmissionSteps] = useState([{ id: Date.now(), text: "" }]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["adminAcademicDegrees"],
    queryFn: academicDegreesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: academicDegreesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAcademicDegrees"] });
      toast.success("Academic Degree added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add item")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => academicDegreesApi.update(editingItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAcademicDegrees"] });
      toast.success("Academic Degree updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update item")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => academicDegreesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAcademicDegrees"] });
      toast.success("Academic Degree deleted successfully");
      setConfirmModal({ isOpen: false });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete item")
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        degree_code: item.degree_code || "",
        full_name: item.full_name || "",
        university: item.university || "",
        duration: item.duration || "",
        focus_area: item.focus_area || "",
        is_public: item.is_public ?? true
      });

      // Parse Eligibility
      if (item.eligibility) {
        try {
          const parsed = typeof item.eligibility === 'string' 
            ? JSON.parse(item.eligibility) 
            : item.eligibility;
            
          setEligibilityData({
            level: parsed.level || "",
            stream: parsed.stream || "",
            subjects: Array.isArray(parsed.subjects) ? parsed.subjects.join(", ") : (parsed.subjects || ""),
            minAggregate: parsed.minAggregate || "",
            aLevelEquivalent: parsed.aLevelEquivalent || ""
          });
          setIsLegacyEligibility(false);
          setLegacyEligibility("");
        } catch (e) {
          setIsLegacyEligibility(true);
          setLegacyEligibility(typeof item.eligibility === 'object' ? JSON.stringify(item.eligibility) : item.eligibility);
          setEligibilityData({ level: "", stream: "", subjects: "", minAggregate: "", aLevelEquivalent: "" });
        }
      } else {
        setIsLegacyEligibility(false);
        setLegacyEligibility("");
        setEligibilityData({ level: "", stream: "", subjects: "", minAggregate: "", aLevelEquivalent: "" });
      }

      // Parse Admissions
      if (item.admission_process) {
        const steps = item.admission_process.split(' | ').map((text, i) => ({ id: Date.now() + i, text: text.trim() }));
        setAdmissionSteps(steps.length > 0 ? steps : [{ id: Date.now(), text: "" }]);
      } else {
        setAdmissionSteps([{ id: Date.now(), text: "" }]);
      }

    } else {
      setEditingItem(null);
      setFormData({
        degree_code: "", full_name: "", university: "", duration: "", 
        focus_area: "", is_public: true
      });
      setEligibilityData({ level: "", stream: "", subjects: "", minAggregate: "", aLevelEquivalent: "" });
      setIsLegacyEligibility(false);
      setLegacyEligibility("");
      setAdmissionSteps([{ id: Date.now(), text: "" }]);
    }
    setIsModalOpen(true);
  };

  const handleAddStep = () => {
    setAdmissionSteps([...admissionSteps, { id: Date.now(), text: "" }]);
  };

  const handleRemoveStep = (id) => {
    if (admissionSteps.length > 1) {
      setAdmissionSteps(admissionSteps.filter(s => s.id !== id));
    }
  };

  const handleStepChange = (id, text) => {
    setAdmissionSteps(admissionSteps.map(s => s.id === id ? { ...s, text } : s));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Process Eligibility Data
    const processedEligibility = {
      level: eligibilityData.level.trim(),
      stream: eligibilityData.stream.trim(),
      subjects: eligibilityData.subjects ? eligibilityData.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      minAggregate: eligibilityData.minAggregate ? Number(eligibilityData.minAggregate) : null,
      aLevelEquivalent: eligibilityData.aLevelEquivalent.trim()
    };
    
    // Remove empty keys
    Object.keys(processedEligibility).forEach(key => {
      if (processedEligibility[key] === "" || processedEligibility[key] === null || (Array.isArray(processedEligibility[key]) && processedEligibility[key].length === 0)) {
        delete processedEligibility[key];
      }
    });

    let finalEligibility = null;
    if (Object.keys(processedEligibility).length > 0) {
      finalEligibility = JSON.stringify(processedEligibility);
    } else if (isLegacyEligibility && legacyEligibility) {
      finalEligibility = legacyEligibility; // Keep legacy if user didn't enter structured data
    }

    // Process Admission Steps
    const finalAdmissionProcess = admissionSteps
      .map(s => s.text.trim())
      .filter(Boolean)
      .join(" | ");

    const finalData = {
      ...formData,
      eligibility: finalEligibility,
      admission_process: finalAdmissionProcess
    };

    if (editingItem) updateMutation.mutate(finalData);
    else createMutation.mutate(finalData);
  };

  const confirmDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Academic Degree",
      message: `Are you sure you want to delete ${item.full_name}?`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutate(item.id)
    });
  };

  // Simplified Columns
  const columns = [
    { header: "Code", accessor: "degree_code", render: (row) => <span className="font-bold text-blue-400">{row.degree_code}</span> },
    { header: "Full Name", accessor: "full_name", render: (row) => <span className="font-medium">{row.full_name}</span> },
    { header: "University", accessor: "university", render: (row) => <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md text-xs">{row.university}</span> },
    { header: "Duration", accessor: "duration" },
    { header: "Status", accessor: "is_public", render: (row) => (
        row.is_public ? 
        <span className="text-green-500 flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3"/> Public</span> : 
        <span className="text-gray-400 flex items-center gap-1 text-xs"><XCircle className="w-3 h-3"/> Hidden</span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Academic Guide</h1>
          <p className="text-sm text-text-muted mt-1">Manage IT-related academic degrees and programs.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Degree
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={data.data || data} 
        isLoading={isLoading} 
        error={error} 
        onView={(item) => setViewingItem(item)}
        onEdit={handleOpenModal} 
        onDelete={confirmDelete} 
        searchPlaceholder="Search degrees, universities..."
      />

      {/* VIEW MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingItem(null)} />
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
              <div>
                <h2 className="text-xl font-bold text-text-main">{viewingItem.degree_code}</h2>
                <p className="text-sm text-text-muted">{viewingItem.full_name}</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-bg-active rounded-xl transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 text-left">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">University</p>
                  <p className="font-medium">{viewingItem.university || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-medium">{viewingItem.duration || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Focus Areas</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingItem.focus_area ? viewingItem.focus_area.split(',').map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-lg border border-green-500/20">{f.trim()}</span>
                    )) : "-"}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Eligibility Criteria</p>
                <div className="bg-bg-active/50 rounded-xl p-4 border border-border-main">
                  {(() => {
                    if (!viewingItem.eligibility) return <p className="text-sm text-text-muted">No criteria specified.</p>;
                    try {
                      const el = typeof viewingItem.eligibility === 'string' ? JSON.parse(viewingItem.eligibility) : viewingItem.eligibility;
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {el.level && <div><span className="text-text-muted mr-2">Level:</span><span className="font-medium">{el.level}</span></div>}
                          {el.stream && <div><span className="text-text-muted mr-2">Stream:</span><span className="font-medium">{el.stream}</span></div>}
                          {el.minAggregate && <div><span className="text-text-muted mr-2">Minimum Aggregate:</span><span className="font-medium">{el.minAggregate}%</span></div>}
                          {el.aLevelEquivalent && <div><span className="text-text-muted mr-2">A-Level Equivalent:</span><span className="font-medium">{el.aLevelEquivalent}</span></div>}
                          {el.subjects && el.subjects.length > 0 && (
                            <div className="col-span-2 mt-2">
                              <span className="text-text-muted block mb-1">Required Subjects:</span>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(el.subjects) ? el.subjects.map((sub, i) => <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">{sub}</span>) : <span>{String(el.subjects)}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } catch(e) {
                      return <p className="text-sm">{typeof viewingItem.eligibility === 'object' ? JSON.stringify(viewingItem.eligibility) : viewingItem.eligibility}</p>;
                    }
                  })()}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Admission Process</p>
                {viewingItem.admission_process ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:ml-[13px] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-main before:to-transparent">
                    {viewingItem.admission_process.split(' | ').map((step, i) => (
                      <div key={i} className="relative flex items-start space-x-4">
                        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-bg-card border-2 border-blue-500 shadow-sm shrink-0">
                          <span className="text-xs font-bold text-blue-500">{i + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-sm text-text-main">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-text-muted">No process specified.</p>}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30 shrink-0">
              <h2 className="text-lg font-bold text-text-main">{editingItem ? "Edit Academic Degree" : "Add Academic Degree"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-bg-active rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">
              
              {/* SECTION 1: Basic Info */}
              <section>
                <h3 className="font-bold text-text-main border-b border-border-main pb-2 mb-4">1. Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Degree Code *</label>
                    <input required value={formData.degree_code} onChange={(e) => setFormData({...formData, degree_code: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. BSc.CSIT" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">University</label>
                    <input value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Tribhuvan University" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-text-muted mb-1 block">Full Name *</label>
                    <input required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Bachelor of Science in Computer Science and Information Technology" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Duration</label>
                    <input value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. 4 Years (8 Semesters)" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Focus Area (Comma separated)</label>
                    <input value={formData.focus_area} onChange={(e) => setFormData({...formData, focus_area: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Software, Networking" />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Eligibility */}
              <section>
                <div className="flex items-center justify-between border-b border-border-main pb-2 mb-4">
                  <h3 className="font-bold text-text-main">2. Eligibility Criteria</h3>
                  {isLegacyEligibility && (
                    <Badge variant="yellow" className="text-[10px]">Legacy Data Detected</Badge>
                  )}
                </div>

                {isLegacyEligibility && legacyEligibility && (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">Legacy Format Detected</p>
                      <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mb-2">We found plain text instead of structured data. Please extract the details into the structured fields below to convert it. If you leave the fields empty, the legacy text will be preserved.</p>
                      <div className="p-2 bg-black/10 dark:bg-black/20 rounded text-xs font-mono text-text-main break-words">
                        {legacyEligibility}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-active/30 p-4 rounded-xl border border-border-main">
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Academic Level</label>
                    <input value={eligibilityData.level} onChange={(e) => setEligibilityData({...eligibilityData, level: e.target.value})} className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm" placeholder="e.g. 10+2 or Equivalent" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Required Stream</label>
                    <input value={eligibilityData.stream} onChange={(e) => setEligibilityData({...eligibilityData, stream: e.target.value})} className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm" placeholder="e.g. Science" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-text-muted mb-1 block">Required Subjects (Comma separated)</label>
                    <input value={eligibilityData.subjects} onChange={(e) => setEligibilityData({...eligibilityData, subjects: e.target.value})} className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm" placeholder="e.g. Physics, Mathematics" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">Minimum Aggregate (%)</label>
                    <input type="number" min="0" max="100" value={eligibilityData.minAggregate} onChange={(e) => setEligibilityData({...eligibilityData, minAggregate: e.target.value})} className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted mb-1 block">A-Level Equivalent Grade</label>
                    <input value={eligibilityData.aLevelEquivalent} onChange={(e) => setEligibilityData({...eligibilityData, aLevelEquivalent: e.target.value})} className="w-full px-3 py-2 bg-bg-card border border-border-main rounded-xl text-sm" placeholder="e.g. D Grade" />
                  </div>
                </div>
              </section>

              {/* SECTION 3: Admission Process */}
              <section>
                <div className="flex items-center justify-between border-b border-border-main pb-2 mb-4">
                  <h3 className="font-bold text-text-main">3. Admission Process Steps</h3>
                  <button type="button" onClick={handleAddStep} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
                
                <div className="space-y-3">
                  {admissionSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-1 border border-blue-500/20">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <input 
                          value={step.text} 
                          onChange={(e) => handleStepChange(step.id, e.target.value)} 
                          className="w-full px-3 py-2.5 bg-bg-active border border-border-main rounded-xl text-sm" 
                          placeholder={`Step ${index + 1} description (e.g. Entrance Exam Conducted by TU)`} 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveStep(step.id)}
                        disabled={admissionSteps.length === 1}
                        className="p-2.5 mt-0.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Visibility Options */}
              <section className="pt-2">
                <div className="flex items-center gap-3 p-4 bg-bg-active/50 rounded-xl border border-border-main">
                  <div className="flex-1">
                    <h4 className="font-bold text-text-main text-sm">Public Visibility</h4>
                    <p className="text-xs text-text-muted">Allow students to view this program in the academic guide.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.is_public} onChange={(e) => setFormData({...formData, is_public: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-border-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </section>

              {/* Submit Area */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-bg-card pt-4 border-t border-border-main -mx-6 px-6 -mb-6 pb-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-text-muted hover:bg-bg-active rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                  {editingItem ? "Update Degree" : "Save Degree"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ isOpen: false })} isLoading={deleteMutation.isPending} />
    </div>
  );
};

// Helper component since Badge isn't directly imported in this file and we need a simple one
const Badge = ({ children, variant, className }) => {
  const colors = {
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border font-medium ${colors[variant] || colors.green} ${className}`}>
      {children}
    </span>
  );
};

export default AcademicDegrees;
