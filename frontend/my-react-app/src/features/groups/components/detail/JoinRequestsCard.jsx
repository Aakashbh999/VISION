import { Check, X } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";

const JoinRequestsCard = ({
  joinRequests,
  approveRequestMut,
  declineRequestMut,
}) => {
  return (
    <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm">
      <h3 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4 tracking-wider flex items-center justify-between">
        Approval Queue
        {joinRequests?.length > 0 && (
          <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">
            {joinRequests.length}
          </span>
        )}
      </h3>
      {joinRequests?.length > 0 ? (
        <div className="space-y-3">
          {joinRequests.map((request) => (
            <div
              key={request.request_id}
              className="flex flex-col gap-2 p-3 bg-[var(--bg-active)] rounded-xl border border-[var(--border-main)]"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={request.profile_image}
                  name={request.full_name}
                  size="sm"
                />
                <span className="text-sm font-bold truncate flex-1 text-[var(--text-main)]">
                  {request.full_name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => approveRequestMut.mutate(request.request_id)}
                >
                  <Check className="w-4 h-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-rose-500 hover:bg-rose-50 border-rose-200"
                  onClick={() => declineRequestMut.mutate(request.request_id)}
                >
                  <X className="w-4 h-4" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] font-bold text-center py-4">
          Queue is empty
        </p>
      )}
    </div>
  );
};

export default JoinRequestsCard;
