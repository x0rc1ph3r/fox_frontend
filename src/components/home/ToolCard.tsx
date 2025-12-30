interface ToolCardProps {
  imageSrc: string;
  title: string;
}

export default function ToolCard({ imageSrc, title }: ToolCardProps) {
  return (
    <div className="relative group flex items-center justify-center">
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 rounded-[20px]"
      />

      {/* <div className="absolute -bottom-5 px-[30px] py-2 md:py-3 bg-gray-1400 rounded-full  duration-500 flex items-center md:w-auto w-full justify-center md:max-w-full max-w-[287px]">
        <p className="text-black-1000 text-base font-inter font-semibold">
          {title}
        </p>
      </div> */}
    </div>
  );
}
