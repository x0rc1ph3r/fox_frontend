import { useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useNavbarStore } from "../../../store/globalStore";

import SettingsModel from "./SettingsModel";
import NotificationsModel from "./NotificationsModel";
import DynamicNewLink from "./DynamicNewLink";
import StatsDropdown from "./StatsDropdown";

export const Navbar = () => {
  const {
    isAuth,
    walletAddress,
    showSettingsModal,
    showNotificationModal,
    showMobileMenu,
    toggleMobileMenu,
    openSettings,
    closeSettings,
    openNotifications,
    closeNotifications,
    setAuth,
  } = useNavbarStore();

  const { publicKey, connected } = useWallet();
  const location = useLocation();

  /* ----------------------- Sync wallet → Zustand ----------------------- */
  useEffect(() => {
    if (connected && publicKey) {
      setAuth(true, publicKey.toBase58());
    } else {
      setAuth(false, null);
    }
  }, [connected, publicKey, setAuth]);

  /* ----------------------------- Navigation ----------------------------- */

  const navLinks = [
    { label: "Fox9", path: "/" },
    { label: "Auctions", path: "/auctions" },
    { label: "Gumballs", path: "/gumballs" },
  ];

  const isActive = (linkPath: string) => {
    if (linkPath === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/raffles")
      );
    }
    return location.pathname.startsWith(linkPath);
  };

  const shortAddress =
    walletAddress && `${walletAddress.slice(0, 4)}..${walletAddress.slice(-4)}`;

  /* ----------------------------- JSX ----------------------------- */

  return (
    <header className="w-full flex h-20 md:h-[90px] lg:h-[100px] bg-white border-b border-gray-1100 z-10 relative">
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-6 xl:gap-[60px] w-full justify-between flex-1">
          {/* Logo */}
          <Link to="/" className="inline-flex">
            <img
              className="size-12 md:size-[60px] lg:size-[76px] object-contain"
              src="/fox-logo.png"
              alt="Fox9"
            />
          </Link>

          {/* Mobile Right */}
          <div className="flex items-center lg:hidden gap-3">
            <DynamicNewLink isAuth={isAuth} />

            <WalletMultiButton className="h-11 px-4 rounded-full bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color text-white font-semibold" />

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden inline-flex w-10 h-10 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
            >
              <img src="/icons/menu_icon.svg" className="w-6" />
            </button>
          </div>

          {/* Links */}
          <ul
            className={`${
              showMobileMenu ? "flex" : "hidden"
            } lg:flex lg:flex-row flex-col lg:shadow-none shadow-2xl lg:items-center gap-4 xl:gap-[60px] lg:static absolute top-20 md:top-[90px] p-6 left-0 w-full lg:bg-transparent bg-white`}
          >
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className={`transition duration-500 text-sm md:text-base font-semibold font-inter ${
                    isActive(link.path)
                      ? "text-primary-color"
                      : "text-neutral-800 hover:text-primary-color"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <StatsDropdown />
            </li>

            {/* Mobile icons */}
            <ul className="lg:hidden flex items-center gap-2 mt-4">
              {isAuth && (
                <li>
                  <Link
                    to="/profile"
                    className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
                  >
                    <img src="/icons/user-icon.svg" className="w-5" />
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={openSettings}
                  className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
                >
                  <img src="/icons/settings-icon.svg" className="w-5" />
                </button>
              </li>
              <li>
                <button
                  onClick={openNotifications}
                  className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
                >
                  <img src="/icons/bell-icon.svg" className="w-5" />
                </button>
              </li>
            </ul>
          </ul>
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-5">
          <DynamicNewLink isAuth={isAuth} />

          <WalletMultiButton className="h-11 px-6 py-2.5 rounded-full bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color text-white  font-semibold" />

          {isAuth && (
            <Link
              to="/profile"
              className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
            >
              <img src="/icons/user-icon.svg" className="w-6" />
            </Link>
          )}

          <button
            onClick={openSettings}
            className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
          >
            <img src="/icons/settings-icon.svg" className="w-6" />
          </button>

          <button
            onClick={openNotifications}
            className="inline-flex w-11 h-11 bg-linear-to-r from-black-1000 via-neutral-500 to-black-1000 hover:from-primary-color hover:via-primary-color hover:to-primary-color rounded-full justify-center items-center"
          >
            <img src="/icons/bell-icon.svg" className="w-6" />
          </button>
        </div>
      </nav>

      {/* Modals */}
      <SettingsModel isOpen={showSettingsModal} onClose={closeSettings} />
      <NotificationsModel
        isOpen={showNotificationModal}
        onClose={closeNotifications}
      />
    </header>
  );
};
