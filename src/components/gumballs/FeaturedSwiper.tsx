import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useFeaturedRafflesStore } from "../../../store/featured-gumballs-store";
import CryptoCardSkeleton from "../skeleton/RafflesCardSkeleton";
import { GumballsCard } from "./GumballsCard";
import type { GumballBackendDataType } from "../../../types/backend/gumballTypes";

const FeaturedSwiper = () => {
  const { gumballs, loading, fetchGumballs } = useFeaturedRafflesStore();

  useEffect(() => {
    fetchGumballs();
  }, [fetchGumballs]);

  return (
    <div className="w-full relative lg:-mt-[30px] -mt-6 md:-mt-3.5 px-4 md:pr-6 md:pl-6">
      {loading ? (
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => (
          <CryptoCardSkeleton key={i} className="w-[350px]" />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1.2}
        breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 3.5 },
          }}
            navigation={{
            prevEl: ".prev-btn",
            nextEl: ".next-btn",
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="featured-swiper pb-12! md:pb-14!"
        >
          {gumballs.map((card) => (
            <SwiperSlide key={card.id}>
              <div className="flex-1">
                <GumballsCard gumball={card as unknown as GumballBackendDataType} className="my-0" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
         <div className="w-full px-1 hidden lg:flex items-center justify-between -mt-20 absolute top-1/2 inset-0 z-10 pointer-events-none left-1/2 -translate-1/2">
        <button className="prev-btn transition duration-300 group border pointer-events-auto border-primary-color bg-primary-color cursor-pointer rounded-full w-12 h-12 flex items-center justify-center">
          <img src="/icons/down-arw.svg" className="rotate-90" alt="" />
        </button>

          <button className="next-btn transition duration-300 group border pointer-events-auto border-primary-color bg-primary-color cursor-pointer rounded-full w-12 h-12 flex items-center justify-center">
          <img src="/icons/down-arw.svg" className="-rotate-90" alt="" />
        </button>
          
        </div>
    </div>
  );
};

export default FeaturedSwiper;
