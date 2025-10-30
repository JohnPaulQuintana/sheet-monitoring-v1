import { useState, useMemo } from "react";
import SheetItem from "./SheetItem";
import { X, LogOut, Filter } from "lucide-react";

export default function Sidebar({
  sheets,
  selected,
  onSelect,
  onLogout,
  open,
  onClose,
}: any) {
  const [sortFilter, setSortFilter] = useState("all");

  const filteredSheets = useMemo(() => {
    if (sortFilter === "updated") {
      return sheets.filter((sheet: any) => {
        if (Array.isArray(sheet.sheets)) {
          return sheet.sheets.some((tab: any) => tab.status === "updated");
        }
        return sheet.status === "updated";
      });
    }
    if (sortFilter === "not-updated") {
      return sheets.filter((sheet: any) => {
        if (Array.isArray(sheet.sheets)) {
          return sheet.sheets.every((tab: any) => tab.status !== "updated");
        }
        return sheet.status !== "updated";
      });
    }
    return sheets;
  }, [sheets, sortFilter]);

  const filters = [
    { id: "all", label: "All" },
    { id: "updated", label: "Updated" },
    { id: "not-updated", label: "Not Updated" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-white text-gray-800 flex flex-col shadow-lg border-r border-gray-200 transform z-50 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-green-800">
            Sheet Monitoring
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sort / Filter Bar */}
        <div className="p-3 border-b border-gray-100 bg-green-50/40 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
            <Filter size={16} className="text-green-600 shrink-0" />
            Sort by status
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setSortFilter(f.id)}
                className={`flex-1 p-1 rounded-full text-xs font-medium transition-all duration-200 
                  ${
                    sortFilter === f.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-white border border-green-200 text-green-700 hover:bg-green-100"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sheet List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSheets.length ? (
            filteredSheets.map((sheet: any, index: number) => (
              <SheetItem
                key={index}
                sheet={sheet}
                active={selected?.sheetId === sheet.sheetId}
                onClick={() => onSelect(sheet)}
              />
            ))
          ) : (
            <p className="p-4 text-gray-400 text-sm">No sheets found</p>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-500 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
