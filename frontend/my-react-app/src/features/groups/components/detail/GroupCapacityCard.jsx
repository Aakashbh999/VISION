import { Star } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";

const GroupCapacityCard = ({ group, isOwner, expandCapacityMut }) => {
  return (
    <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm">
      <h3 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4 tracking-wider">
        Capacity Matrix
      </h3>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-[var(--text-main)]">
          {group.members} / {group.capacity} Slots
        </span>
        <Badge color={group.members >= group.capacity ? "rose" : "emerald"}>
          {group.members >= group.capacity ? "Full" : "Available"}
        </Badge>
      </div>
      <div className="w-full bg-[var(--bg-active)] h-2 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${group.members >= group.capacity ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{
            width: `${Math.min(100, (group.members / group.capacity) * 100)}%`,
          }}
        />
      </div>
      {isOwner && group.capacity < 25 && (
        <Button
          variant="outline"
          className="w-full text-xs font-bold dashed border-[var(--border-main)] gap-2"
          onClick={() => expandCapacityMut.mutate()}
          isLoading={expandCapacityMut.isPending}
          title="Costs 100 VXP"
        >
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Expand
          Capacity (+2)
        </Button>
      )}
    </div>
  );
};

export default GroupCapacityCard;
