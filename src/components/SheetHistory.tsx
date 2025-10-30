import { Clock, User, FileDiff } from "lucide-react";

export default function SheetHistory({ history }: { history: any[] }) {
  if (!history?.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm italic">
          No history available for this sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto max-h-[calc(100vh-12rem)] bg-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileDiff className="text-green-600 w-5 h-5" />
        Change History
      </h2>

      <div className="relative pl-6 border-l border-gray-200 space-y-1">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="relative group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[2rem] top-5 w-3 h-3 bg-green-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></div>

            {/* Content */}
            <div className="p-4">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <User size={15} />
                  <span className="text-gray-600">{entry.email || "Unknown user"}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} className="text-green-600"/>
                  {entry.modifiedTime
                    ? new Date(entry.modifiedTime).toLocaleString()
                    : "Unknown time"}
                </div>
              </div>

              {/* Divider */}
              {/* <div className="my-3 border-t border-gray-100"></div> */}

              {/* Change Details */}
              {/* {Array.isArray(entry.changes) && entry.changes.length > 0 ? (
                <div className="space-y-2">
                  {entry.changes.map((change: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border-l-4 transition-all duration-150 ${
                        change.type === "added"
                          ? "border-green-500 bg-green-50 text-green-800"
                          : change.type === "removed"
                          ? "border-red-500 bg-red-50 text-red-800"
                          : "border-gray-400 bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="font-medium capitalize">
                        {change.type}
                      </span>
                      <span className="text-gray-700 text-sm">
                        {change.description || "No details available"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No detailed changes available.
                </p>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
