"use client";

import navigationData from "../../data/navigationData.json";
import siteConfig from "../../data/siteConfig.json";
import Link from "next/link";

import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiSend,
} from "react-icons/fi";
const FooterPage = () => {
  return (
    <footer className=" bg-gray-200 text-balck py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Social Media */}
        <div className="flex gap-6 justify-start mb-12">
          {navigationData.socialMedia.map((social) => (
            <a
              key={social.id}
              href={social.href}
              className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.icon === "facebook" && <FiFacebook className="text-2xl" />}
              {social.icon === "linkedin" && <FiLinkedin className="text-xl" />}
              {social.icon === "twitter" && <FiTwitter className="text-xl" />}
              {social.icon === "instagram" && (
                <FiInstagram className="text-xl" />
              )}
              {social.icon === "send" && <FiSend className="text-xl" />}
            </a>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">درباره آوینا</h3>
            <ul className="space-y-3 text-gray-800">
              {navigationData.footerLinks.about.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="hover:text-black hover:bg-gray-300 hover:rounded-lg pl-10 pr-2 py-1 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">خریداران</h3>
            <ul className="space-y-3 text-gray-800">
              {navigationData.footerLinks.buyers.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="hover:text-black hover:bg-gray-300 hover:rounded-lg pl-10 pr-2 py-1 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">فروشندگان</h3>
            <ul className="space-y-3 text-gray-800">
              {navigationData.footerLinks.sellers.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="hover:text-black hover:bg-gray-300 hover:rounded-lg pl-10 pr-2 py-1 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">اطلاعات بیشتر</h3>
            <ul className="space-y-3 text-gray-800">
              {navigationData.footerLinks.info.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="hover:text-black hover:bg-gray-300 hover:rounded-lg pl-10 pr-2 py-1 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-800 text-sm mb-4 md:mb-0">
              <p>{siteConfig.contact.address}</p>
              <p className="mt-1">تلفن: {siteConfig.contact.phone}</p>
              <p className="mt-1">ایمیل: {siteConfig.contact.email}</p>
            </div>
            <div className="text-gray-900 text-sm text-center md:text-right">
              <p>
                &copy; {new Date().getFullYear()} تمام حقوق محفوظ {siteConfig.site.name} است.{" "}
                
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
