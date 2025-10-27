const Requirements = () => {
  const requirements = [
    {
      text: (
        <>
          You must be at least 18 years old. <br />
          If you are younger, you can apply and we will contact you once you
          turn 18.
        </>
      ),
      bgColor: "bg-[#F2A6B0]",
    },
    {
      text: "Driving license A1 or A if you want to use your scooter for delivery.",
      bgColor: "bg-[#F6C243]",
    },
    {
      text: "work permit for the country of application.",
      bgColor: "bg-[#C1DADE]",
    },
    {
      text: "If you are an EEA citizen, you will need a valid passport or European identity card",
      bgColor: "bg-[#EFEDEA]",
    },
  ];
  return (
    <div className="space-y-4">
      <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold">
        What you need
      </h2>
      <p>Before you can start as a delivery driver, you need</p>

      <div className="space-y-4">
        {requirements.map((item, index) => (
          <div
            key={index}
            className={`flex px-4 h-auto py-3 lg:py-0 lg:h-24 rounded-lg ${item.bgColor} space-x-4 items-center`}
          >
            <div className="border border-theme-black-2 rounded-full  px-2 py-[3px] lg:px-0 lg:py-0 md:w-8 md:h-8 flex justify-center items-center bg-white">
              ✓
            </div>
            <p className="font-sf text-theme-black-2 text-base">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requirements;
