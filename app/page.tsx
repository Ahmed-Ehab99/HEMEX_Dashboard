import BasicTabs from "./components/BasicTabs";
import StudentProfile from "./components/StudentProfile";
import { SessionsProvider } from "./context/SessionsContext";

export default function Home() {
  return (
    <SessionsProvider studentId={8} trackId={1}>
      <div className="bg-[#e3e3e3]">
        <div className="max-w-screen-xl mx-auto lg:py-10 py-5 xl:px-0 lg:px-10 px-5">
          <StudentProfile />

          <div className="flex justify-between items-center md:text-start text-center md:mt-24 mt-16 mb-10">
            <div className="capitalize flex flex-col">
              <h2 className="md:text-4xl text-3xl font-bold">
                turn screen time into skill time
              </h2>
              <h3 className="md:text-3xl text-2xl font-normal">
                learn coding today
              </h3>
            </div>
          </div>
        </div>
      </div>

      <BasicTabs />
    </SessionsProvider>
  );
}
