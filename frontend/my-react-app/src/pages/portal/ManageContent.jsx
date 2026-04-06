import React, { useState } from "react";
import {
  BookOpen,
  MessageSquare,
  Users,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyResources } from "../../hooks/useMyResources";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import DeleteAction from "../../components/DeleteAction";

const ManageContent = () => {
  const [activeTab, setActiveTab] = useState("resources");

  const { data: resources = [], isLoading: loadingResources } =
    useMyResources();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-0 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight mb-2">
            Manage Content
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg font-medium max-w-2xl">
            Keep track of all the resources, discussions, and groups you've
            created across VISION.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-card)] p-2 rounded-2xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "resources"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
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
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          My Discussions
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "groups"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <Users className="w-5 h-5" />
          My Groups
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--bg-card)] rounded-3xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x overflow-hidden min-h-[400px]">
        {activeTab === "resources" && (
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
                Resource Uploads
              </h2>
              <Link
                to="/resources/my"
                className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View in Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingResources ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-active)] rounded-2xl border-2 border-dashed border-[var(--border-main)]">
                <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                  No Resources Found
                </h3>
                <p className="text-[var(--text-muted)] mb-6">
                  You haven't uploaded any resources yet.
                </p>
                <Link
                  to="/resources"
                  className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Go to Library
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-main)]">
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Title
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Type
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Date
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Status
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-main)]">
                    {resources.map((resource) => (
                      <tr
                        key={resource.resource_id}
                        className="group hover:bg-[var(--bg-active)] transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-bold text-[var(--text-main)] mb-1 truncate max-w-xs">
                            {resource.title}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-muted)] capitalize text-sm">
                          {resource.resource_type}
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-muted)] text-sm">
                          {formatDistanceToNow(new Date(resource.created_at), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              resource.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : resource.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <DeleteAction
                            targetType="resource"
                            targetId={resource.resource_id}
                            itemName={resource.title}
                            buttonClassName="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            iconClassName="w-5 h-5"
                          />
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
            <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-2">
              My Discussions
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Manage your discussion threads here.
            </p>
            <Link
              to="/discussions/my-posts"
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
            >
              Go to My Posts
            </Link>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="p-6 md:p-8 text-center py-20">
            <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-2">
              My Groups
            </h2>
            <p className="text-[var(--text-muted)]">
              Manage groups you've created here. (Coming Soon)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContent;
