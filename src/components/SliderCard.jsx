export default function SliderCard(props) {
  return (
    <div
      className={`py-6 px-5 lg:h-96 md:h-72 h-60 ${props.img} bg-cover bg-center rounded-lg flex flex-col justify-end sm:gap-y-2 gap-y-1 relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:rounded-lg before:bg-opacity-20`}
    >
      <h4 className="font-extrabold sm:text-xl text-base relative">
        {props.title}
      </h4>
      <p className="font-normal sm:text-base text-sm relative">{props.desc}</p>
      <div className="absolute bg-theme-green py-3 px-2 font-normal sm:text-base text-sm top-0 right-9">
        {props.tag}
      </div>
    </div>
  );
}
