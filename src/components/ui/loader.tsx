
import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
};

export default Loader;
