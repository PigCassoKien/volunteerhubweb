import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="text-sm text-gray-600 mb-4 flex items-center flex-wrap">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index !== 0 && <FiChevronRight className="mx-2 text-gray-400" />}

          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-emerald-600 transition font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
