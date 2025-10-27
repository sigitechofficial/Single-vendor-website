export default function Order(props) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-5">
        <div className="bg-white rounded-md shadow-large p-2">
          <img
            src={`/images/checkout/prod-1.webp`}
            alt={props.alt}
            className="w-16 h-12"
          />
        </div>
        <div className="flex gap-3 items-center text-black font-semibold">
          <span className="text-greenColor">{props.quantity}x</span>
          {props.name}
        </div>
      </div>
      <div className="text-greenColor font-semibold">${props.price}</div>
    </div>
  );
}
