import { RotatingLines } from "react-loader-spinner";
import loader from "../../public/images/loader2.gif";
export default function Loader() {
  return (
    <section className="fixed h-screen w-full bg-themeBlue z-[100] flex justify-center items-center ">
      <div className="border bg-[#de2129] rounded-full">
        <img src={loader} alt="" />
      </div>
    </section>
  );
}
export function MiniLoader() {
  return (
    <section className="absolute h-full w-full top-0 left-0 z-[100] flex justify-center items-center">
      {/* <CirclesWithBar width={100} height={100} color="#202053" visible={true} /> */}
    </section>
  );
}
export function RotatingLoader({w,h}) {
  return (
    <section className="">
      <RotatingLines
        visible={true}
        height={h||"96"}
        width={w||"96"}
        color="grey"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </section>
  );
}
