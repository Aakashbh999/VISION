import React, { useState } from "react";
import { BookOpen, MessageSquare, Users, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyResources } from "../../hooks/useMyResources";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { softDeleteResource } from "../../services/resource";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ManageContent = () => {
  const [activeTab, setActiveTab] = useState("resources");
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading: loadingResources } = useMyResources();

  const handleDeleteResource = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await softDeleteResource(id, "User deleted their own resource");
        toast.success("Resource deleted successfully");
        queryClient.invalidateQueries(["myResources"]);
      } catch (err) {
        toast.error("Failed to delete resource");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Manage Content
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-2xl">
            Keep track of all the resources, discussions, and groups you've created across VISION.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "resources"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          My Resources
        </button>
        <button
          onClick={() => setActiveTab("discussions")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "discussions"
              ? "bg-purple-50 text-purple-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          My Discussions
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "groups"
              ? "bg-green-50 text-green-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Users className="w-5 h-5" />
          My Groups
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === "resources" && (
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Resource Uploads</h2>
              <Link 
                to="/resources/my"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View in Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingResources ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Resources Found</h3>
                <p className="text-gray-500 mb-6">You haven't uploaded any resources yet.</p>
                <Link to="/resources" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Go to Library
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Title</th>
                      <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Type</th>
                      <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                      <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                      <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resources.map((resource) => (
                      <tr key={resource.resource_id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-gray-900 mb-1 truncate max-w-xs">{resource.title}</p>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 capitalize text-sm">{resource.resource_type}</td>
                        <td className="py-4 pr-4 text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            resource.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            resource.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteResource(resource.resource_id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "discussions" && (
          <div className="p-6 md:p-8 text-center py-20">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">My Discussions</h2>
            <p className="text-gray-500 mb-6">Manage your discussion threads here.</p>
            <Link to="/discussions/my-posts" className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors">
              Go to My Posts
            </Link>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="p-6 md:p-8 text-center py-20">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">My Groups</h2>
            <p className="text-gray-500">Manage groups you've created here. (Coming Soon)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContent;
