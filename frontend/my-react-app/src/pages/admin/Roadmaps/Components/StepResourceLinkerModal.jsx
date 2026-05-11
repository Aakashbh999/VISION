import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Search, Link as LinkIcon, Plus, ChevronLeft, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { getResources, uploadResource } from "../../../../services/resource";
import { addResourceToStep } from "../../../../services/adminRoadmap";

const StepResourceLinkerModal = ({ stepId, roadmapId, onClose, existingResourceIds = [] }) => {
  const [mode, setMode] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  const queryClient = useQueryClient();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["adminResourceSearch", searchTerm],
    queryFn: () => getResources({ search: searchTerm }),
    enabled: mode === "search" && searchTerm.length > 2,
    staleTime: 60 * 1000,
  });

  const linkExistingMut = useMutation({
    mutationFn: (resourceId) => addResourceToStep(stepId, { resource_id: resourceId, is_required: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
      toast.success("Resource linked successfully");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to link resource");
    }
  });

  const createAndLinkMut = useMutation({
    mutationFn: async (data) => {

      const resourceResponse = await uploadResource({
        ...data,
        resource_type: "link",
        status: "approved",
      });

      const newResourceId = resourceResponse.resource_id;

      return addResourceToStep(stepId, {
        resource_id: newResourceId,
        is_required: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
      toast.success("New link created and added to step");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to create and link resource");
    }
  });

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newLink.title.trim() || !newLink.url.trim()) {
      return toast.error("Title and URL are required");
    }

    try {
      new URL(newLink.url);
    } catch (_) {
      return toast.error("Please enter a valid URL (including https://)");
    }
    createAndLinkMut.mutate(newLink);
  };

  const resources = searchResults?.data || searchResults || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)] shrink-0">
          <div className="flex items-center gap-3">
            {mode === "create" && (
              <button
                onClick={() => setMode("search")}
                className="p-1.5 hover:bg-[var(--bg-active)] rounded-lg text-[var(--text-muted)] transition-colors"
                title="Back to Search"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-black text-[var(--text-main)]">
              {mode === "search" ? "Add Resource" : "Create New Link"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "search" ? (
          <>
            <div className="p-6 border-b border-[var(--border-main)] shrink-0 bg-[var(--bg-main)]/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search existing resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setMode("create")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="whitespace-nowrap">Create Link</span>
                </button>
              </div>
              {searchTerm.length > 0 && searchTerm.length < 3 && (
                <p className="text-xs text-[var(--text-muted)] mt-2 ml-1">Type at least 3 characters to search.</p>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isSearching ? (
                <div className="text-center py-8 text-[var(--text-muted)]">Searching...</div>
              ) : resources.length > 0 ? (
                <div className="space-y-3">
                  {resources.map((res) => {
                    const isAlreadyLinked = existingResourceIds.includes(res.resource_id);
                    return (
                      <div key={res.resource_id} className="flex items-center justify-between p-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl">
                        <div className="mr-4">
                          <h4 className="font-bold text-[var(--text-main)] truncate max-w-[300px] sm:max-w-[400px]">{res.title}</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1 capitalize">{res.resource_type}</p>
                        </div>
                        {isAlreadyLinked ? (
                          <span className="text-sm font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">Linked</span>
                        ) : (
                          <button
                            onClick={() => linkExistingMut.mutate(res.resource_id)}
                            disabled={linkExistingMut.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            <LinkIcon className="w-4 h-4" /> Link
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : searchTerm.length > 2 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)] mb-4">No results found matching "{searchTerm}"</p>
                  <button
                    onClick={() => {
                      setNewLink({ ...newLink, title: searchTerm });
                      setMode("create");
                    }}
                    className="text-purple-600 font-bold hover:underline"
                  >
                    Create a new resource for "{searchTerm}"?
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  Search for resources to attach them to this step.
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateNew} className="p-6 space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 p-4 rounded-xl flex gap-3">
              <Globe className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900 dark:text-purple-200">
                This will create a new <strong>Link</strong> resource in the platform and immediately link it to this step.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">Link Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official React Documentation"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">Destination URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setMode("search")}
                disabled={createAndLinkMut.isPending}
                className="px-5 py-2.5 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAndLinkMut.isPending}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createAndLinkMut.isPending ? "Creating..." : (
                  <>
                    <Plus className="w-4 h-4" /> Create and Link
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StepResourceLinkerModal;
