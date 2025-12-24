import { Link, useLocation } from '@tanstack/react-router';

function DynamicNewLink({ isAuth }: { isAuth: boolean }) {
  const location = useLocation();
  let linkTo = '';
  let enabled = false;
  if(localStorage.getItem("authToken")){
    isAuth = true;
  }
  if (location.pathname === '/' || location.pathname.startsWith('/raffles')) {
    linkTo = '/raffles/create_raffles';
    enabled = true;
  } else if (location.pathname.startsWith('/auctions')) {
    linkTo = '/auctions/create_auctions';
    enabled = true;
  } else if (location.pathname.startsWith('/gumballs')) {
    linkTo = '/gumballs/create_gumballs';
    enabled = true;
  }

  const isClickable = isAuth && enabled;
  console.log("isClickable",isClickable);
  console.log("linkTo",linkTo);
  console.log("enabled",enabled);
  console.log("isAuth",isAuth);

  return (
    <Link
      to={isClickable ? linkTo : '#'}
      className={`h-11 px-8 py-2.5 border rounded-full flex items-center gap-2.5 transition duration-300 ${
        isClickable
          ? 'hover:bg-primary-color border-black-1000 hover:border-primary-color'
          : 'border border-black-1000 cursor-not-allowed opacity-50 pointer-events-none'
      }`}
    >
      <img src="/icons/plus-icon.svg" className="size-4" />
      <span className="text-neutral-800 text-base font-semibold font-inter">
        New
      </span>
    </Link>
  );
}

export default DynamicNewLink;
