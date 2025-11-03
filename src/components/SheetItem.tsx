import { FileSpreadsheet, CircleCheck } from "lucide-react";

export default function SheetItem({ sheet, active, onClick }: any) {
  // console.log(active)
  const hasTabs = Array.isArray(sheet.sheets);
  console.log(sheet)
  // A sheet is considered "updated" if itself or any of its tabs are updated
  const isUpdated = hasTabs
    ? sheet.sheets.some((tab: any) => tab.status === "updated")
    : false;

  const visibleTabs = hasTabs ? sheet.sheets.slice(0, 3) : []; // show first 3
  const hiddenCount = hasTabs ? sheet.sheets.length - visibleTabs.length : 0;

  return (
    <div
      // onClick={onClick}
      className={`mx-3 my-2 p-3 rounded-lg cursor-pointer transition-all border ${
        active
          ? "bg-white border-green-500 shadow-sm"
          : "hover:bg-gray-100 border-transparent"
      } ${isUpdated ? "border-green-300" : "border-red-300"}`}
    >
      {/* Main Sheet Header */}
      <div className="flex justify-between items-center">
        <span
          className={`font-medium text-sm flex items-center gap-1 ${
            isUpdated ? "text-green-700" : "text-red-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          {sheet.title || "Untitled Sheet"}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isUpdated ? "bg-green-500" : "bg-red-400"
          }`}
          title={isUpdated ? "Updated" : "Not Updated"}
        />
      </div>

      {/* Last modified timestamp */}
      <span className="text-xs text-gray-500 block mt-1">
        {sheet.lastModifiedTime
          ? new Date(sheet.lastModifiedTime).toLocaleString()
          : "Unknown time"}
      </span>

      {/* Tabs Section */}
      {/* {hasTabs && sheet.sheets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {visibleTabs.map((tab: any) => {
            const updated = tab.status === "updated";
            return (
              <div
                key={tab.sheetId || tab.title}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  updated
                    ? "bg-green-600 text-white border border-green-500"
                    : "bg-red-500 text-white border border-red-500"
                }`}
              >
                {updated && <CircleCheck className="w-3 h-3 text-white" />}
                <span className="truncate max-w-[100px]">
                  {tab.title || "Unnamed Tab"}
                </span>
              </div>
            );
          })}

          
          {hiddenCount > 0 && (
            <span
              title={sheet.sheets
                .slice(3)
                .map((t: any) => t.title)
                .join(", ")}
              className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600 border border-gray-300 cursor-default"
            >
              +{hiddenCount} more
            </span>
          )}
        </div>
      )} */}
    </div>
  );
}
