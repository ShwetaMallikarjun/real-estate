import Link from "next/link";
import { Building2 } from "lucide-react";

const quickLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/agents", label: "Agents" },
  { href: "/developers", label: "Developers" },
  { href: "/about", label: "About Us" },
];

const resources = [
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "#", label: "FAQ" },
  { href: "#", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Building2 className="h-5 w-5" />
              RealEstate
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We connect
              buyers, sellers, and agents across the country.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-2">
              {resources.map(({ href, label }) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@realestate.com</li>
              <li>Phone: +62 21 1234 5678</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} RealEstate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
