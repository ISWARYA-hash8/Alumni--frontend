import React from 'react';
import { Link } from 'react-router-dom';

function QuickLinks({ links = [] }) {
  if (!links.length) return null;
  return (
    <div className="bg-white shadow p-4 rounded mb-6">
      <h3 className="font-semibold mb-2">Quick Links</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-blue-600 hover:underline whitespace-nowrap"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickLinks;
