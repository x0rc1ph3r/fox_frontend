import GradientText from "../common/GradientText";

export const TryToolsSection = () => {
  return (
    <section className="w-full pb-6 pt-[51px] md:pt-16 relative">
      <div className="w-full max-w-[1440px] px-5 mx-auto">
        <div className="w-full flex 2xl:items-end items-start justify-center md:justify-between">
          <img
            src="/images/home/fox-vector-1.png"
            className="w-[142px] md:block hidden"
            alt="decor"
          />
          <div className="flex flex-col items-center justify-center">
            <GradientText
              title="FOX9 Project Games"
              className="2xl:text-[150px] md:pb-0 pb-[61px] text-[54px] md:text-[66px] lg:text-[100px] leading-[100%]"
            />
            {/* <p
              className="md:text-base text-sm absolute bottom-14 font-semibold font-inter bg-gray-1400 py-2.5 md:py-3 px-8 text-black-1000 text-center inline-flex rounded-full md:max-w-full max-w-[361px]"
            >
              TRY OUT SOME OF OUR OTHER TOOLS!
            </p> */}
          </div>
          <img
            src="/images/home/fox-vector-2.png"
            className="w-[142px] md:block hidden"
            alt="decor"
          />
        </div>
      </div>
    </section>
  );
};
