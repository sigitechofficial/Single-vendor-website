export default function StoreSideMenu(props) {
  return (
    <div className="flex items-center gap-x-4 py-2 px-2 md:px-3 ">
      <div className="  rounded-fullest shadow-smShadow">
        <img
          src={props.img}
          alt={``}
          className="w-10 h-10 rounded-fullest object-cover"
        />
      </div>
      <div className="font-medium text-sm   capitalize">{props.title}</div>
    </div>
  );
}
