import { Menu } from "lucide-react";

export default function Header({ user, title, onMenuToggle }: { user: any; title: string; onMenuToggle: () => void }) {
  // console.log(user)
  return (
    <header className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-green-700 hover:bg-green-100 rounded-md transition"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-green-700">{title}</h1>
      </div>

      <span className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">
        {user.email}
      </span>
    </header>
  );
}
