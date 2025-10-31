import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Clock,
  Check,
  X,
  CircleUser,
  LucideFileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserAccordionProps {
  user: string;
  sheets: any[];
  sheetCount: number;
  updatedCount: number;
  notUpdatedCount: number;
  lastUpdated: string;
  onSelectSheet: (sheet: any) => void;
}

export default function UserAccordion({
  user,
  sheets,
  sheetCount,
  updatedCount,
  notUpdatedCount,
  lastUpdated,
  onSelectSheet,
}: UserAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      className="bg-white border border-gray-200 rounded-lg mb-2 transition-shadow hover:shadow-sm"
    >
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        {/* Left: User Info */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 mb-2">
            <CircleUser className="shrink-0 text-green-800 w-5" />
            <span className="text-sm font-semibold text-green-800">{user}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500 gap-3">
            <span className="flex items-center gap-1">
              <LucideFileSpreadsheet size={12} className="text-green-800" />
              {sheetCount} {sheetCount === 1 ? "sheet" : "sheets"}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-green-800" />
              {lastUpdated}
            </span>
          </div>
        </div>

        {/* Right: Status + Chevron */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Check size={12} className="text-green-600" />
            <span className="text-xs">{updatedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <X size={12} className="text-red-600" />
            <span className="text-xs">{notUpdatedCount}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.div>
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="px-2 py-1">
              {sheets.length > 0 ? (
                sheets.map((sheet, index) => {
                  const userLower = user.toLowerCase();
                  const hasUpdated = sheet.history?.some(
                    (h: any) => h.user?.toLowerCase() === userLower
                  );
                  const lastModified = new Date(sheet.lastModifiedTime);
                  const now = new Date();
                  const isSameDay =
                    lastModified.getFullYear() === now.getFullYear() &&
                    lastModified.getMonth() === now.getMonth() &&
                    lastModified.getDate() === now.getDate();
                  const isUpdated = hasUpdated && isSameDay;

                  return (
                    <motion.div
                      key={sheet.spreadsheetId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    //   onClick={() => onSelectSheet(sheet)}
                      className={`group flex flex-col md:flex-row items-start md:items-center justify-between 
                        px-5 py-3 border border-gray-100 rounded-md mb-1 cursor-pointer transition-all duration-200 
                        hover:shadow-sm hover:bg-gray-50
                        ${
                          isUpdated
                            ? "border-l-4 border-green-500"
                            : "border-l-4 border-red-500"
                        }
                      `}
                    >
                      {/* Left Section */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-md 
                            ${
                              isUpdated
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                        >
                          <FileSpreadsheet size={16} />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800 truncate max-w-[220px]">
                            {sheet.title}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {new Date(
                              sheet.lastModifiedTime
                            ).toLocaleString() || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex justify-end items-end w-full mt-2 md:mt-0">
                        {isUpdated ? (
                          <div className="flex items-center border p-1 bg-green-700 rounded-md">
                            <Check size={16} className="text-white" />
                            <span className="text-xs text-white font-medium ml-1">
                              Completed
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center border p-1 bg-red-700 rounded-md">
                            <X size={16} className="text-white" />
                            <span className="text-xs text-white font-medium ml-1">
                              Not Completed
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-2 text-gray-400 text-sm">
                  No sheets found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
