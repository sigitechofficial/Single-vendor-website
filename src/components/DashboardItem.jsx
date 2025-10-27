export default function DashboardItem(props) {
  const { Icon } = props;
  return (
    <li>
      <button
        onClick={props.setTab}
        className={`py-[17.3px] px-4 flex items-center gap-x-4 bg-white shadow-discoveryCardShadow rounded w-full border ${
          props.tab === props.title ? "border-theme-red" : "border-transparent"
        }`}
      >
        <Icon size={24} className="text-theme-black-2" />
        <span className="font-semibold lg:text-base text-sm text-theme-black-2">
          {props.title}
        </span>
      </button> 
    </li>
  );
}
